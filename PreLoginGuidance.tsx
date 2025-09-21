import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { HelpCircle, ChevronRight } from "lucide-react"
import { PreLoginOption, UserType } from "@/types/auth"

interface PreLoginGuidanceProps {
    title: string
    options: PreLoginOption[]
    onSelect: (loginType: UserType) => void
    onClose: () => void
}

export function PreLoginGuidance({ title, options, onSelect, onClose }: PreLoginGuidanceProps) {
    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
            <Card className="max-w-2xl mx-4 bg-white/95 backdrop-blur-md border-0 shadow-2xl">
                <CardHeader className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-4">
                        <HelpCircle className="h-6 w-6 text-orange-500" />
                        <CardTitle className="text-2xl text-gray-900">{title}</CardTitle>
                    </div>
                    <p className="text-gray-600">Choose the option that best describes you:</p>
                </CardHeader>

                <CardContent className="space-y-4">
                    {options.map((option, index) => (
                        <Button
                            key={index}
                            variant="outline"
                            className="w-full justify-between h-auto p-6 text-left hover:bg-orange-50 hover:border-orange-200"
                            onClick={() => onSelect(option.loginType)}
                        >
                            <div>
                                <div className="font-medium text-gray-900 mb-1">{option.question}</div>
                                <div className="text-sm text-orange-600 font-medium">{option.answer}</div>
                            </div>
                            <ChevronRight className="h-5 w-5 text-gray-400" />
                        </Button>
                    ))}

                    <div className="pt-4 border-t">
                        <Button
                            variant="ghost"
                            onClick={onClose}
                            className="w-full text-gray-500 hover:text-gray-700"
                        >
                            I'll choose manually
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}