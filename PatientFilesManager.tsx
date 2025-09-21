import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { FileText, Search, User, Calendar, Eye } from 'lucide-react';

interface PatientFile {
  id: string;
  patient_email: string;
  patient_name: string;
  created_at: string;
  updated_at: string;
  document_records: {
    id: string;
    document_url: string;
    document_type: string;
    created_at: string;
    status: string;
    reviewed_by: string | null;
    reviewed_at: string | null;
  }[];
}

export const PatientFilesManager = () => {
  const [patientFiles, setPatientFiles] = useState<PatientFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchPatientFiles();
  }, []);

  const fetchPatientFiles = async () => {
    try {
      const { data, error } = await supabase
        .from('patient_files')
        .select(`
          *,
          document_records(
            id,
            document_url,
            document_type,
            created_at,
            status,
            reviewed_by,
            reviewed_at
          )
        `)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setPatientFiles(data || []);
    } catch (error) {
      console.error('Error fetching patient files:', error);
      toast({
        title: "Error",
        description: "Failed to fetch patient files",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredFiles = patientFiles.filter(file =>
    file.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    file.patient_email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="p-6">Loading patient files...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Patient Files Management</h2>
        <Button onClick={fetchPatientFiles} variant="outline">
          Refresh
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by patient name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="grid gap-4">
        {filteredFiles.map((file) => (
          <Card key={file.id} className="border-l-4 border-l-primary">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <CardTitle className="text-lg">{file.patient_name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{file.patient_email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">
                    {file.document_records.length} documents
                  </Badge>
                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(file.updated_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              {file.document_records.length > 0 ? (
                <div className="space-y-3">
                  <h4 className="font-medium text-sm">Documents in File:</h4>
                  <div className="grid gap-2">
                    {file.document_records.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <FileText className="w-4 h-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium text-sm">{doc.document_type}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(doc.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={doc.status === 'reviewed' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {doc.status}
                          </Badge>
                          
                          {doc.document_url && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => window.open(doc.document_url, '_blank')}
                            >
                              <Eye className="w-3 h-3 mr-1" />
                              View
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <FileText className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">No documents in this file yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredFiles.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <User className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              {searchTerm ? 'No patients found matching your search' : 'No patient files found'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};