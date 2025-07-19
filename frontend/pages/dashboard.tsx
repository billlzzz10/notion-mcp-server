import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  BookOpen,
  Users, 
  MapPin, 
  FileText,
  BarChart3,
  Workflow,
  Brain,
  Library,
  Target,
  Zap 
} from "lucide-react"

interface DashboardStats {
  characters: number
  scenes: number
  locations: number
  wordCount: number
}

interface QuickAction {
  title: string
  description: string
  icon: React.ReactNode
  href: string
  color: string
}

export default function Dashboard() {
  const stats: DashboardStats = {
    characters: 42,
    scenes: 128,
    locations: 36,
    wordCount: 89420
  }

  const quickActions: QuickAction[] = [
    {
      title: "เพิ่มตัวละคร",
      description: "สร้างตัวละครใหม่",
      icon: <Users className="h-5 w-5" />,
      href: "/characters/new",
      color: "bg-blue-500 hover:bg-blue-600"
    },
    {
      title: "เขียนฉากใหม่",
      description: "เพิ่มฉากใหม่",
      icon: <FileText className="h-5 w-5" />,
      href: "/scenes/new", 
      color: "bg-green-500 hover:bg-green-600"
    },
    {
      title: "สร้างสถานที่",
      description: "เพิ่มสถานที่ใหม่",
      icon: <MapPin className="h-5 w-5" />,
      href: "/locations/new",
      color: "bg-purple-500 hover:bg-purple-600"
    },
    {
      title: "วิเคราะห์เนื้อหา",
      description: "AI วิเคราะห์ความสอดคล้อง",
      icon: <Brain className="h-5 w-5" />,
      href: "/analysis",
      color: "bg-orange-500 hover:bg-orange-600"
    }
  ]

  const features = [
    {
      title: "🎨 Workflow Canvas",
      description: "จัดการโครงเรื่องแบบ visual",
      status: "กำลังพัฒนา"
    },
    {
      title: "🤖 AI Co-Pilot",
      description: "ผู้ช่วย AI สำหรับการเขียน",
      status: "กำลังพัฒนา"
    },
    {
      title: "📚 Creative Prompt Library",
      description: "คลังไอเดียและ prompt",
      status: "กำลังพัฒนา"
    },
    {
      title: "📊 Dynamic Asset Tracker",
      description: "ติดตามความสอดคล้องของเนื้อหา",
      status: "กำลังพัฒนา"
    },
    {
      title: "💡 Psychology-Informed Nudges",
      description: "คำแนะนำที่ปรับตามจิตวิทยา",
      status: "กำลังพัฒนา"
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            📖 Ashval Story Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            ศูนย์ควบคุมการเขียนนวนิยาย Ashval - ระบบจัดการเนื้อหาแบบ AI-Powered
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">ตัวละคร</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.characters}</div>
              <p className="text-xs text-muted-foreground">
                +2 ใหม่ในสัปดาห์นี้
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">ฉาก</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.scenes}</div>
              <p className="text-xs text-muted-foreground">
                +12 ใหม่ในสัปดาห์นี้
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">สถานที่</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.locations}</div>
              <p className="text-xs text-muted-foreground">
                +5 ใหม่ในสัปดาห์นี้
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">จำนวนคำ</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.wordCount.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                +3,420 ในสัปดาห์นี้
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">การดำเนินการด่วน</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className={`w-12 h-12 rounded-lg ${action.color} text-white flex items-center justify-center mb-2`}>
                    {action.icon}
                  </div>
                  <CardTitle className="text-lg">{action.title}</CardTitle>
                  <CardDescription>{action.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" variant="outline">
                    เริ่มต้น
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Upcoming Features */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">🚀 ฟีเจอร์ที่กำลังจะมา</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((feature, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800">
                    {feature.status}
                  </span>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Current Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              ความคืบหน้าปัจจุบัน
            </CardTitle>
            <CardDescription>
              Phase 3: Data Analysis & Visualization (กำลังดำเนินการ)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">วิเคราะห์ไฟล์ Vault</span>
                <span className="text-sm text-gray-500">528 ไฟล์ | กำลังวิเคราะห์...</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full w-[65%]"></div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Google Sheets Integration</span>
                <span className="text-sm text-green-600">✓ เสร็จสิ้น</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full w-full"></div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Image Generation Service</span>
                <span className="text-sm text-green-600">✓ เสร็จสิ้น</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full w-full"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
