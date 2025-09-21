import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'
import { Eye, EyeOff, LogIn, UserPlus } from 'lucide-react'
import type { PatientRegistrationData } from '@/types/patient'

interface PatientAuthModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  title?: string
  description?: string
}

export default function PatientAuthModal({
  isOpen,
  onClose,
  onSuccess,
  title = "Authentication Required",
  description = "Please sign in or create an account to continue with your form submission."
}: PatientAuthModalProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('login')

  // Registration profile data
  const [profileData, setProfileData] = useState<Partial<PatientRegistrationData>>({
    first_name: '',
    last_name: '',
    phone: '',
    date_of_birth: '',
    street_address: '',
    suburb: '',
    state: '',
    postcode: '',
    country: 'Australia'
  })

  const { login, signup } = useAuth()
  const { toast } = useToast()

  const resetForm = () => {
    setEmail('')
    setPassword('')
    setConfirmPassword('')
    setShowPassword(false)
    setShowConfirmPassword(false)
    setIsLoading(false)
    setProfileData({
      first_name: '',
      last_name: '',
      phone: '',
      date_of_birth: '',
      street_address: '',
      suburb: '',
      state: '',
      postcode: '',
      country: 'Australia'
    })
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('🎯 PatientAuthModal: Starting login process')
    console.log('📧 Email:', email)
    setIsLoading(true)

    try {
      const result = await login(email, password)
      console.log('📥 PatientAuthModal: Received login result:', result)

      if (result.success && result.user) {
        console.log('🎉 PatientAuthModal: Login successful')
        toast({
          title: "Welcome back!",
          description: "Successfully logged in to your patient account.",
        })
        resetForm()
        onSuccess()
      } else {
        console.log('❌ PatientAuthModal: Login failed:', result.error)
        toast({
          title: "Login failed",
          description: result.error || "Invalid email or password. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('🚨 PatientAuthModal: Login exception:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      toast({
        title: "Login error",
        description: `An unexpected error occurred: ${errorMessage}`,
        variant: "destructive",
      })
    } finally {
      console.log('🔄 PatientAuthModal: Login process completed')
      setIsLoading(false)
    }
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('🎯 PatientAuthModal: Starting signup process')
    console.log('📧 Email:', email)
    console.log('📝 Profile data:', profileData)

    // Validation checks with detailed logging
    if (password !== confirmPassword) {
      console.log('❌ PatientAuthModal: Password mismatch validation failed')
      toast({
        title: "Password mismatch",
        description: "Passwords do not match. Please try again.",
        variant: "destructive",
      })
      return
    }

    if (password.length < 6) {
      console.log('❌ PatientAuthModal: Password length validation failed')
      toast({
        title: "Password too short",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      })
      return
    }

    // Validate required profile fields
    if (!profileData.first_name || !profileData.last_name || !profileData.date_of_birth) {
      console.log('❌ PatientAuthModal: Required fields validation failed', {
        first_name: !!profileData.first_name,
        last_name: !!profileData.last_name,
        date_of_birth: !!profileData.date_of_birth
      })
      toast({
        title: "Missing required information",
        description: "Please provide your name and date of birth.",
        variant: "destructive",
      })
      return
    }

    console.log('✅ PatientAuthModal: All validations passed')
    setIsLoading(true)

    try {
      const registrationData: PatientRegistrationData = {
        email,
        password,
        first_name: profileData.first_name!,
        last_name: profileData.last_name!,
        phone: profileData.phone,
        date_of_birth: profileData.date_of_birth!,
        street_address: profileData.street_address || '',
        suburb: profileData.suburb || '',
        state: profileData.state || '',
        postcode: profileData.postcode || '',
        country: profileData.country || 'Australia'
      }

      console.log('📤 PatientAuthModal: Calling signup with registration data:', registrationData)
      const result = await signup(email, password, registrationData)
      console.log('📥 PatientAuthModal: Received signup result:', result)

      if (result.success) {
        console.log('🎉 PatientAuthModal: Signup successful')
        toast({
          title: "Account created!",
          description: result.error 
            ? `Account created with warnings: ${result.error}`
            : "Welcome to MedicAI! Please check your email to verify your account.",
        })
        resetForm()
        onSuccess()
      } else {
        console.log('❌ PatientAuthModal: Signup failed:', result.error)
        toast({
          title: "Signup failed",
          description: result.error || "Unable to create account. Email may already be registered.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('🚨 PatientAuthModal: Signup exception:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      toast({
        title: "Signup error",
        description: `An unexpected error occurred: ${errorMessage}`,
        variant: "destructive",
      })
    } finally {
      console.log('🔄 PatientAuthModal: Signup process completed')
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg bg-mist border-ink max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-xl text-ink">{title}</DialogTitle>
          <DialogDescription className="text-ink">
            {description}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(value) => {
          setActiveTab(value)
          resetForm()
        }} className="space-y-4">
          <TabsList className="grid w-full grid-cols-2 bg-mist border border-ink">
            <TabsTrigger value="login">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Create Account</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="modal-login-email" className="text-ink">Email</Label>
                <Input
                  id="modal-login-email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="border-ink focus:border-melon"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="modal-login-password" className="text-ink">Password</Label>
                <div className="relative">
                  <Input
                    id="modal-login-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="border-ink focus:border-melon"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  className="flex-1 border-ink text-ink hover:bg-ink hover:text-mist"
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-melon hover:bg-melon/90 text-black"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    "Signing in..."
                  ) : (
                    <>
                      <LogIn className="h-4 w-4 mr-2" />
                      Sign In
                    </>
                  )}
                </Button>
              </div>
            </form>
          </TabsContent>

          <TabsContent value="signup" className="max-h-96 overflow-y-auto">
            <form onSubmit={handleSignup} className="space-y-3">
              <h4 className="text-sm font-medium text-ink">Personal Information</h4>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label htmlFor="first_name" className="text-ink">First Name *</Label>
                  <Input
                    id="first_name"
                    placeholder="John"
                    value={profileData.first_name}
                    onChange={(e) => setProfileData(prev => ({ ...prev, first_name: e.target.value }))}
                    required
                    className="border-ink focus:border-melon h-9"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="last_name" className="text-ink">Last Name *</Label>
                  <Input
                    id="last_name"
                    placeholder="Smith"
                    value={profileData.last_name}
                    onChange={(e) => setProfileData(prev => ({ ...prev, last_name: e.target.value }))}
                    required
                    className="border-ink focus:border-melon h-9"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="modal-signup-email" className="text-ink">Email Address *</Label>
                <Input
                  id="modal-signup-email"
                  type="email"
                  placeholder="john.smith@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="border-ink focus:border-melon h-9"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label htmlFor="phone" className="text-ink">Phone</Label>
                  <Input
                    id="phone"
                    placeholder="0400 123 456"
                    value={profileData.phone}
                    onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                    className="border-ink focus:border-melon h-9"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="date_of_birth" className="text-ink">Date of Birth *</Label>
                  <Input
                    id="date_of_birth"
                    type="date"
                    value={profileData.date_of_birth}
                    onChange={(e) => setProfileData(prev => ({ ...prev, date_of_birth: e.target.value }))}
                    required
                    className="border-ink focus:border-melon h-9"
                  />
                </div>
              </div>

              <h4 className="text-sm font-medium text-ink pt-2">Address (Optional)</h4>

              <div className="space-y-1">
                <Label htmlFor="street_address" className="text-ink">Street Address</Label>
                <Input
                  id="street_address"
                  placeholder="123 Main Street"
                  value={profileData.street_address}
                  onChange={(e) => setProfileData(prev => ({ ...prev, street_address: e.target.value }))}
                  className="border-ink focus:border-melon h-9"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <Label htmlFor="suburb" className="text-ink">Suburb</Label>
                  <Input
                    id="suburb"
                    placeholder="Melbourne"
                    value={profileData.suburb}
                    onChange={(e) => setProfileData(prev => ({ ...prev, suburb: e.target.value }))}
                    className="border-ink focus:border-melon h-9"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="state" className="text-ink">State</Label>
                  <Select
                    value={profileData.state}
                    onValueChange={(value) => setProfileData(prev => ({ ...prev, state: value }))}
                  >
                    <SelectTrigger className="border-ink focus:border-melon h-9">
                      <SelectValue placeholder="VIC" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NSW">NSW</SelectItem>
                      <SelectItem value="VIC">VIC</SelectItem>
                      <SelectItem value="QLD">QLD</SelectItem>
                      <SelectItem value="WA">WA</SelectItem>
                      <SelectItem value="SA">SA</SelectItem>
                      <SelectItem value="TAS">TAS</SelectItem>
                      <SelectItem value="ACT">ACT</SelectItem>
                      <SelectItem value="NT">NT</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="postcode" className="text-ink">Postcode</Label>
                  <Input
                    id="postcode"
                    placeholder="3000"
                    value={profileData.postcode}
                    onChange={(e) => setProfileData(prev => ({ ...prev, postcode: e.target.value }))}
                    className="border-ink focus:border-melon h-9"
                  />
                </div>
              </div>

              <h4 className="text-sm font-medium text-ink pt-2">Password</h4>

              <div className="space-y-1">
                <Label htmlFor="modal-signup-password" className="text-ink">Password *</Label>
                <div className="relative">
                  <Input
                    id="modal-signup-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Create a password (min 6 characters)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="border-ink focus:border-melon h-9"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                  </Button>
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="modal-confirm-password" className="text-ink">Confirm Password *</Label>
                <div className="relative">
                  <Input
                    id="modal-confirm-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="border-ink focus:border-melon h-9"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                  </Button>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  className="flex-1 border-ink text-ink hover:bg-ink hover:text-mist"
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-melon hover:bg-melon/90 text-black"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    "Creating account..."
                  ) : (
                    <>
                      <UserPlus className="h-3 w-3 mr-2" />
                      Create Account
                    </>
                  )}
                </Button>
              </div>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}