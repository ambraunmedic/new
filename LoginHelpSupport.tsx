import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MessageCircle, Phone, Mail, HelpCircle } from "lucide-react"
import { ContactOption, CommonIssue } from "@/types/auth"

interface LoginHelpSupportProps {
    title: string
    contactOptions: ContactOption[]
    commonIssues: CommonIssue[]
    onClose: () => void
}

export function LoginHelpSupport({ title, contactOptions, commonIssues, onClose }: LoginHelpSupportProps) {
    const getContactIcon = (type: string) => {
        switch (type) {
            case 'chat': return MessageCircle
            case 'phone': return Phone
            case 'email': return Mail
            default: return HelpCircle
        }
    }

    const handleContactClick = (option: ContactOption) => {
        switch (option.type) {
            case 'phone':
                window.open(`tel:${option.number}`)
                break
            case 'email':
                window.open(`mailto:${option.address}`)
                break
            case 'chat':
                // Implement chat integration
                console.log('Opening chat...')
                break
        }
    }

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
            <Card className="max-w-3xl mx-4 max-h-[90vh] overflow-y-auto bg-white/95 backdrop-blur-md border-0 shadow-2xl">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl text-gray-900 flex items-center justify-center gap-2">
                        <HelpCircle className="h-6 w-6 text-orange-500" />
                        {title}
                    </CardTitle>
                </CardHeader>

                <CardContent className="space-y-6">
                    {/* Contact Options */}
                    <div>
                        <h3 className="font-semibold text-gray-900 mb-4">Get Help Now</h3>
                        <div className="grid md:grid-cols-3 gap-4">
                            {contactOptions.map((option, index) => {
                                const IconComponent = getContactIcon(option.type)
                                return (
                                    <Button
                                        key={index}
                                        variant="outline"
                                        className="h-auto p-4 flex flex-col items-center gap-2 hover:bg-orange-50 hover:border-orange-200"
                                        onClick={() => handleContactClick(option)}
                                    >
                                        <IconComponent className="h-6 w-6 text-orange-500" />
                                        <div className="text-center">
                                            <div className="font-medium text-gray-900">{option.text}</div>
                                            {option.availability && (
                                                <div className="text-xs text-gray-500">{option.availability}</div>
                                            )}
                                            {option.number && (
                                                <div className="text-xs text-gray-600">{option.number}</div>
                                            )}
                                            {option.address && (
                                                <div className="text-xs text-gray-600">{option.address}</div>
                                            )}
                                        </div>
                                    </Button>
                                )
                            })}
                        </div>
                    </div>

                    {/* Common Issues */}
                    <div>
                        <h3 className="font-semibold text-gray-900 mb-4">Common Questions</h3>
                        <div className="space-y-3">
                            {commonIssues.map((issue, index) => (
                                <Card key={index} className="border border-gray-200">
                                    <CardContent className="p-4">
                                        <h4 className="font-medium text-gray-900 mb-2">{issue.issue}</h4>
                                        <p className="text-sm text-gray-600">{issue.solution}</p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>

                    <div className="pt-4 border-t text-center">
                        <Button
                            onClick={onClose}
                            variant="outline"
                            className="w-full md:w-auto"
                        >
                            Close Help
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}