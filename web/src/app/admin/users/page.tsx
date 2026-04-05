// import { prisma } from "@/lib/prisma"
// import UserSearchClient from "./UserSearchClient"
import { UserManagementTable } from "@/components/user-management-table"
import { UserManagementTable_page } from "@/components/user-management-table-page"

export default async function UserPage() {
  //   user
  // const allUsers = await prisma.user.findMany()

return(<div className="h-screen w-screen bg-amber-500"><UserManagementTable_page></UserManagementTable_page></div>)
}