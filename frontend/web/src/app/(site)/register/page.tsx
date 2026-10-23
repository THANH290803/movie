import { SiteAuthScreen } from '@/features/auth/components/site-auth-screen'

export const metadata = { title: 'Đăng ký | Cineflow' }

export default async function RegisterPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  return <SiteAuthScreen mode="register" next={(await searchParams).next} />
}
