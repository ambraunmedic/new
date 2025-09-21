import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'
import { Eye, EyeOff, LogIn, UserPlus } from 'lucide-react'
import type { PatientRegistrationData } from '@/types/patient'

export default function PatientAuth() {
  // Login form state
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  // Signup form state
  const [registrationData, setRegistrationData] = useState<PatientRegistrationData>({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    phone: '',
    date_of_birth: '',
    gender: undefined,
    street_address: '',
    suburb: '',
    state: '',
    postcode: '',
    country: 'Australia',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    emergency_contact_relationship: ''
  })
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('login')
  const [signupStep, setSignupStep] = useState(1)

  const { user, login, signup } = useAuth()
  const { toast } = useToast()

  // Redirect if already logged in as patient
  if (user?.role === 'patient') {
    return <Navigate to="/patient" replace />
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('🎯 PatientAuth: Starting login process')
    console.log('📧 Email:', email)
    setIsLoading(true)

    try {
      const result = await login(email, password)
      console.log('📥 PatientAuth: Received login result:', result)

      if (result.success && result.user) {
        console.log('🎉 PatientAuth: Login successful')
        toast({
          title: "Welcome back!",
          description: "Successfully logged in to your patient account.",
        })
        // Navigation will be handled by auth context
      } else {
        console.log('❌ PatientAuth: Login failed:', result.error)
        toast({
          title: "Login failed",
          description: result.error || "Invalid email or password. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('🚨 PatientAuth: Login exception:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      toast({
        title: "Login error",
        description: `An unexpected error occurred: ${errorMessage}`,
        variant: "destructive",
      })
    } finally {
      console.log('🔄 PatientAuth: Login process completed')
      setIsLoading(false)
    }
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('🎯 PatientAuth: Starting signup process')
    console.log('📧 Email:', registrationData.email)
    console.log('📝 Registration data:', registrationData)

    // Validation checks with detailed logging
    if (registrationData.password !== confirmPassword) {
      console.log('❌ PatientAuth: Password mismatch validation failed')
      toast({
        title: "Password mismatch",
        description: "Passwords do not match. Please try again.",
        variant: "destructive",
      })
      return
    }

    if (registrationData.password.length < 6) {
      console.log('❌ PatientAuth: Password length validation failed')
      toast({
        title: "Password too short",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      })
      return
    }

    // Validate required fields
    const requiredFields = [
      'email', 'first_name', 'last_name', 'date_of_birth',
      'street_address', 'suburb', 'state', 'postcode'
    ]

    console.log('🔍 PatientAuth: Validating required fields')
    for (const field of requiredFields) {
      const fieldValue = registrationData[field as keyof PatientRegistrationData]
      if (!fieldValue) {
        console.log(`❌ PatientAuth: Missing required field: ${field}`)
        toast({
          title: "Missing information",
          description: `Please provide your ${field.replace('_', ' ')}.`,
          variant: "destructive",
        })
        return
      }
      console.log(`✅ PatientAuth: Field ${field} is valid:`, fieldValue)
    }

    console.log('✅ PatientAuth: All validations passed')
    setIsLoading(true)

    try {
      console.log('📤 PatientAuth: Calling signup function')
      const result = await signup(registrationData.email, registrationData.password, registrationData)
      console.log('📥 PatientAuth: Received signup result:', result)

      if (result.success) {
        console.log('🎉 PatientAuth: Signup successful')
        toast({
          title: "Account created!",
          description: result.error
            ? `Account created with warnings: ${result.error}`
            : "Welcome to MedicAI! Please check your email to verify your account.",
        })
        // Navigate will happen via auth context
      } else {
        console.log('❌ PatientAuth: Signup failed:', result.error)
        toast({
          title: "Signup failed",
          description: result.error || "Unable to create account. Email may already be registered.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('🚨 PatientAuth: Signup exception:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      toast({
        title: "Signup error",
        description: `An unexpected error occurred: ${errorMessage}`,
        variant: "destructive",
      })
    } finally {
      console.log('🔄 PatientAuth: Signup process completed')
      setIsLoading(false)
    }
  }

  const nextStep = () => {
    if (signupStep === 1) {
      if (!registrationData.email || !registrationData.password || !confirmPassword) {
        toast({
          title: "Missing information",
          description: "Please fill in all fields",
          variant: "destructive",
        })
        return
      }
      if (registrationData.password !== confirmPassword) {
        toast({
          title: "Password mismatch",
          description: "Passwords do not match. Please try again.",
          variant: "destructive",
        })
        return
      }
    } else if (signupStep === 2) {
      if (!registrationData.first_name || !registrationData.last_name || !registrationData.date_of_birth) {
        toast({
          title: "Missing information",
          description: "Please fill in all personal information fields",
          variant: "destructive",
        })
        return
      }
    } else if (signupStep === 3) {
      if (!registrationData.street_address || !registrationData.suburb || !registrationData.state || !registrationData.postcode) {
        toast({
          title: "Missing information",
          description: "Please fill in all address fields",
          variant: "destructive",
        })
        return
      }
    }
    if (signupStep < 3) {
      setSignupStep(signupStep + 1)
    }
  }

  const prevStep = () => {
    if (signupStep > 1) {
      setSignupStep(signupStep - 1)
    }
  }

  const resetForm = () => {
    setEmail('')
    setPassword('')
    setRegistrationData({
      email: '',
      password: '',
      first_name: '',
      last_name: '',
      phone: '',
      date_of_birth: '',
      gender: undefined,
      street_address: '',
      suburb: '',
      state: '',
      postcode: '',
      country: 'Australia',
      emergency_contact_name: '',
      emergency_contact_phone: '',
      emergency_contact_relationship: ''
    })
    setConfirmPassword('')
    setShowPassword(false)
    setShowConfirmPassword(false)
    setSignupStep(1)
  }

  return (
    <div className="min-h-screen bg-mist flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-ink mb-2">Patient Portal</h1>
          <p className="text-ink">Access your medical forms and documents</p>
        </div>

        <Card className="bg-mist backdrop-blur-md border-ink shadow-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-ink">Welcome</CardTitle>
            <CardDescription className="text-ink">
              Sign in to your existing account or create a new one
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={(value) => {
              setActiveTab(value)
              resetForm()
            }} className="space-y-4">
              <TabsList className="grid w-full grid-cols-2 bg-mist border border-ink rounded-none h-12">
                <TabsTrigger value="login">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Create Account</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="border-ink focus:border-melon"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <div className="relative">
                      <Input
                        id="login-password"
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

                  <Button
                    type="submit"
                    className="w-full bg-melon hover:bg-melon/90 text-black"
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
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <div className="space-y-4">
                  {signupStep === 1 && (
                    <>
                      <div className="text-center mb-4">
                        <h3 className="text-lg font-semibold text-ink">Step 1: Account Details</h3>
                        <p className="text-ink/70 text-sm">Create your login credentials</p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="signup-email">Email</Label>
                        <Input
                          id="signup-email"
                          type="email"
                          placeholder="Enter your email"
                          value={registrationData.email}
                          onChange={(e) => setRegistrationData(prev => ({ ...prev, email: e.target.value }))}
                          required
                          className="border-ink focus:border-melon"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="signup-password">Password</Label>
                        <div className="relative">
                          <Input
                            id="signup-password"
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Create a password (min 6 characters)"
                            value={registrationData.password}
                            onChange={(e) => setRegistrationData(prev => ({ ...prev, password: e.target.value }))}
                            required
                            minLength={6}
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
                      <div className="space-y-2">
                        <Label htmlFor="confirm-password">Confirm Password</Label>
                        <div className="relative">
                          <Input
                            id="confirm-password"
                            type={showConfirmPassword ? 'text' : 'password'}
                            placeholder="Confirm your password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            className="border-ink focus:border-melon"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          >
                            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>
                      <Button 
                        onClick={nextStep} 
                        className="w-full bg-melon hover:bg-melon/90 text-black"
                      >
                        Next Step
                      </Button>
                    </>
                  )}

                  {signupStep === 2 && (
                    <>
                      <div className="text-center mb-4">
                        <h3 className="text-lg font-semibold text-ink">Step 2: Personal Information</h3>
                        <p className="text-ink/70 text-sm">Tell us about yourself</p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="first-name">First Name</Label>
                        <Input
                          id="first-name"
                          type="text"
                          value={registrationData.first_name}
                          onChange={(e) => setRegistrationData(prev => ({ ...prev, first_name: e.target.value }))}
                          className="border-ink focus:border-melon"
                          placeholder="Enter your first name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="last-name">Last Name</Label>
                        <Input
                          id="last-name"
                          type="text"
                          value={registrationData.last_name}
                          onChange={(e) => setRegistrationData(prev => ({ ...prev, last_name: e.target.value }))}
                          className="border-ink focus:border-melon"
                          placeholder="Enter your last name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="date-of-birth">Date of Birth</Label>
                        <Input
                          id="date-of-birth"
                          type="date"
                          value={registrationData.date_of_birth}
                          onChange={(e) => setRegistrationData(prev => ({ ...prev, date_of_birth: e.target.value }))}
                          className="border-ink focus:border-melon"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          onClick={prevStep} 
                          variant="outline"
                          className="flex-1 border-ink text-ink hover:bg-ink/10"
                        >
                          Previous
                        </Button>
                        <Button 
                          onClick={nextStep} 
                          className="flex-1 bg-melon hover:bg-melon/90 text-black"
                        >
                          Next Step
                        </Button>
                      </div>
                    </>
                  )}

                  {signupStep === 3 && (
                    <>
                      <div className="text-center mb-4">
                        <h3 className="text-lg font-semibold text-ink">Step 3: Address Information</h3>
                        <p className="text-ink/70 text-sm">Where can we reach you?</p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="street-address">Street Address</Label>
                        <Input
                          id="street-address"
                          type="text"
                          value={registrationData.street_address}
                          onChange={(e) => setRegistrationData(prev => ({ ...prev, street_address: e.target.value }))}
                          className="border-ink focus:border-melon"
                          placeholder="Enter your street address"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-2">
                          <Label htmlFor="suburb">Suburb</Label>
                          <Input
                            id="suburb"
                            type="text"
                            value={registrationData.suburb}
                            onChange={(e) => setRegistrationData(prev => ({ ...prev, suburb: e.target.value }))}
                            className="border-ink focus:border-melon"
                            placeholder="Suburb"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="postcode">Postcode</Label>
                          <Input
                            id="postcode"
                            type="text"
                            value={registrationData.postcode}
                            onChange={(e) => setRegistrationData(prev => ({ ...prev, postcode: e.target.value }))}
                            className="border-ink focus:border-melon"
                            placeholder="Postcode"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="state">State</Label>
                        <Select value={registrationData.state} onValueChange={(value) => setRegistrationData(prev => ({ ...prev, state: value }))}>
                          <SelectTrigger className="border-ink focus:border-melon">
                            <SelectValue placeholder="Select State" />
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
                      <div className="flex gap-2">
                        <Button 
                          onClick={prevStep} 
                          variant="outline"
                          className="flex-1 border-ink text-ink hover:bg-ink/10"
                        >
                          Previous
                        </Button>
                        <Button 
                          onClick={handleSignup} 
                          className="flex-1 bg-melon hover:bg-melon/90 text-black"
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            "Creating account..."
                          ) : (
                            <>
                              <UserPlus className="h-4 w-4 mr-2" />
                              Create Account
                            </>
                          )}
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              </TabsContent>
            </Tabs>

            <div className="mt-6 text-center">
              <Button
                variant="link"
                onClick={() => window.location.href = '/'}
                className="text-ink hover:text-melon"
              >
                Back to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
