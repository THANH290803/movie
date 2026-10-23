import { SiteAuthScreen } from '@/features/auth/components/site-auth-screen'

export const metadata = { title: 'Đăng nhập | Cineflow' }

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  return <SiteAuthScreen mode="login" next={(await searchParams).next} />
}
