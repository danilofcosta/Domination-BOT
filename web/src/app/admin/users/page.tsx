import { UserManagementTable_page } from "@/components/user-management-table-page"
import { getSession } from "@/lib/auth"

export default async function UserPage() {
  const session = await getSession()

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-amber-900/20 to-background">
      <div className="flex flex-col mb-8 px-4 lg:px-6 pt-4">
        <h2 className="text-2xl font-black uppercase italic tracking-tighter shrink-0">Gestão de Usuários</h2>
        <div className="h-1 w-12 bg-primary rounded-full mt-1" />
        {session && (
          <p className="text-xs text-muted-foreground mt-2">
            Logado como: <span className="font-bold">{session.firstName}</span> ({session.profileType})
          </p>
        )}
      </div>
      <UserManagementTable_page currentUser={session} />
    </div>
  )
}