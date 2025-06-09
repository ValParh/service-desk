"use client"

import { useAuth } from "@/contexts/auth-context"
import { useLanguage } from "@/contexts/language-context"
import { Navigation } from "@/components/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Search, Plus, Edit, Trash2, UserCheck, UserX, Clock, CheckCircle } from "lucide-react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { dataStore, type User, type PendingUser } from "@/lib/data-store"

export default function UsersPage() {
  const { user, isLoading } = useAuth()
  const { t } = useLanguage()
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([])
  const [activeTab, setActiveTab] = useState("active")

  useEffect(() => {
    dataStore.init()
    if (!isLoading && !user) {
      router.push("/login")
    }
    if (!isLoading && user && user.role !== "admin") {
      router.push("/")
    }
  }, [user, isLoading, router])

  useEffect(() => {
    if (user && user.role === "admin") {
      loadData()
    }
  }, [user])

  const loadData = () => {
    const allUsers = dataStore.getUsers()
    const allPendingUsers = dataStore.getPendingUsers()
    setUsers(allUsers)
    setPendingUsers(allPendingUsers)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">{t("common.loading")}</div>
      </div>
    )
  }

  if (!user || user.role !== "admin") {
    return null
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800"
      case "support":
        return "bg-blue-100 text-blue-800"
      case "client":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.department && u.department.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesRole = roleFilter === "all" || u.role === roleFilter
    const matchesStatus = statusFilter === "all" || (statusFilter === "active" ? u.isActive : !u.isActive)
    return matchesSearch && matchesRole && matchesStatus
  })

  const handleEditUser = (userData: User) => {
    setEditingUser(userData)
    setIsEditDialogOpen(true)
  }

  const handleSaveUser = () => {
    if (editingUser) {
      const updatedUser = dataStore.updateUser(editingUser.id, editingUser)
      if (updatedUser) {
        loadData()
        setIsEditDialogOpen(false)
        setEditingUser(null)

        if (user.id === editingUser.id) {
          localStorage.setItem("currentUser", JSON.stringify(updatedUser))
          window.location.reload()
        }
      }
    }
  }

  const handleToggleUserStatus = (userId: string) => {
    const userToUpdate = users.find((u) => u.id === userId)
    if (userToUpdate) {
      const updatedUser = dataStore.updateUser(userId, { isActive: !userToUpdate.isActive })
      if (updatedUser) {
        loadData()
      }
    }
  }

  const handleDeleteUser = (userId: string) => {
    if (confirm(t("messages.deleteConfirm"))) {
      dataStore.deleteUser(userId)
      loadData()
    }
  }

  const handleApproveUser = (pendingUserId: string) => {
    const approvedUser = dataStore.approvePendingUser(pendingUserId)
    if (approvedUser) {
      loadData()

      dataStore.addNotification({
        userId: "all",
        type: "user_registered",
        title: t("users.approve"),
        message: `${t("users.approve")} ${approvedUser.firstName} ${approvedUser.lastName}`,
        relatedId: approvedUser.id,
      })
    }
  }

  const handleRejectUser = (pendingUserId: string) => {
    if (confirm(t("messages.deleteConfirm"))) {
      dataStore.rejectPendingUser(pendingUserId)
      loadData()
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{t("users.title")}</h1>
            <p className="text-gray-600 mt-2">{t("users.subtitle")}</p>
          </div>
          <Link href="/users/add">
            <Button className="bg-orange-500 hover:bg-orange-600">
              <Plus className="w-4 h-4 mr-2" />
              {t("users.addUser")}
            </Button>
          </Link>
        </div>

        <div className="space-y-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab("active")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "active"
                    ? "border-orange-500 text-orange-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <UserCheck className="w-4 h-4 inline mr-2" />
                {t("users.activeUsers")} ({users.length})
              </button>
              <button
                onClick={() => setActiveTab("pending")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "pending"
                    ? "border-orange-500 text-orange-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <Clock className="w-4 h-4 inline mr-2" />
                {t("users.pendingUsers")} ({pendingUsers.length})
              </button>
            </nav>
          </div>

          {activeTab === "active" && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>{t("common.filter")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col lg:flex-row gap-4">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          placeholder={`${t("common.search")}...`}
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <Select value={roleFilter} onValueChange={setRoleFilter}>
                      <SelectTrigger className="w-full lg:w-48">
                        <SelectValue placeholder={t("users.role")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{t("common.all")}</SelectItem>
                        <SelectItem value="admin">{t("role.admin")}</SelectItem>
                        <SelectItem value="support">{t("role.support")}</SelectItem>
                        <SelectItem value="client">{t("role.client")}</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-full lg:w-48">
                        <SelectValue placeholder={t("users.status")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{t("common.all")}</SelectItem>
                        <SelectItem value="active">{t("common.active")}</SelectItem>
                        <SelectItem value="inactive">{t("common.inactive")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {t("users.firstName")} / {t("users.lastName")}
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {t("users.email")} / {t("users.phone")}
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {t("users.role")}
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {t("users.department")}
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {t("users.status")}
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {t("users.lastLogin")}
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {t("users.actions")}
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredUsers.map((userData) => (
                          <tr key={userData.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {userData.lastName} {userData.firstName} {userData.middleName}
                                </div>
                                <div className="text-sm text-gray-500">ID: {userData.id}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{userData.email}</div>
                              <div className="text-sm text-gray-500">{userData.phone}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <Badge className={getRoleColor(userData.role)}>{t(`role.${userData.role}`)}</Badge>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {userData.department || "—"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <Badge
                                className={
                                  userData.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                                }
                              >
                                {userData.isActive ? t("common.active") : t("common.inactive")}
                              </Badge>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {userData.lastLogin ? new Date(userData.lastLogin).toLocaleDateString() : "—"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <div className="flex justify-end space-x-2">
                                <Button variant="ghost" size="sm" onClick={() => handleEditUser(userData)}>
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleToggleUserStatus(userData.id)}
                                  className={
                                    userData.isActive
                                      ? "text-red-600 hover:text-red-700"
                                      : "text-green-600 hover:text-green-700"
                                  }
                                >
                                  {userData.isActive ? (
                                    <UserX className="w-4 h-4" />
                                  ) : (
                                    <UserCheck className="w-4 h-4" />
                                  )}
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteUser(userData.id)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "pending" && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>{t("users.pendingUsers")}</CardTitle>
                  <p className="text-sm text-gray-600">{t("users.subtitle")}</p>
                </CardHeader>
                <CardContent>
                  {pendingUsers.length === 0 ? (
                    <div className="text-center py-8">
                      <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                      <p className="text-gray-500">{t("users.noPendingUsers")}</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {pendingUsers.map((pendingUser) => (
                        <div key={pendingUser.id} className="border rounded-lg p-4 bg-yellow-50">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h3 className="font-medium text-gray-900">
                                {pendingUser.lastName} {pendingUser.firstName} {pendingUser.middleName}
                              </h3>
                              <div className="mt-1 text-sm text-gray-600">
                                <p>
                                  {t("users.email")}: {pendingUser.email}
                                </p>
                                <p>
                                  {t("users.phone")}: {pendingUser.phone}
                                </p>
                                <p>
                                  {t("users.role")}: {t(`role.${pendingUser.role}`)}
                                </p>
                                <p>
                                  {t("common.create")}: {new Date(pendingUser.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <div className="flex space-x-2 ml-4">
                              <Button
                                size="sm"
                                className="bg-green-500 hover:bg-green-600"
                                onClick={() => handleApproveUser(pendingUser.id)}
                              >
                                <CheckCircle className="w-4 h-4 mr-1" />
                                {t("users.approve")}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-red-600 border-red-600 hover:bg-red-50"
                                onClick={() => handleRejectUser(pendingUser.id)}
                              >
                                <UserX className="w-4 h-4 mr-1" />
                                {t("users.reject")}
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {filteredUsers.length === 0 && activeTab === "active" && (
          <Card className="mt-6">
            <CardContent className="text-center py-12">
              <p className="text-gray-500">{t("users.noUsers")}</p>
            </CardContent>
          </Card>
        )}

        {/* Диалог редактирования пользователя */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{t("users.editUser")}</DialogTitle>
            </DialogHeader>
            {editingUser && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">{t("users.firstName")}</Label>
                    <Input
                      id="firstName"
                      value={editingUser.firstName}
                      onChange={(e) => setEditingUser({ ...editingUser, firstName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">{t("users.lastName")}</Label>
                    <Input
                      id="lastName"
                      value={editingUser.lastName}
                      onChange={(e) => setEditingUser({ ...editingUser, lastName: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">{t("users.email")}</Label>
                  <Input
                    id="email"
                    type="email"
                    value={editingUser.email}
                    onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">{t("users.phone")}</Label>
                  <Input
                    id="phone"
                    value={editingUser.phone}
                    onChange={(e) => setEditingUser({ ...editingUser, phone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">{t("users.role")}</Label>
                  <Select
                    value={editingUser.role}
                    onValueChange={(value) => setEditingUser({ ...editingUser, role: value as any })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="client">{t("role.client")}</SelectItem>
                      <SelectItem value="support">{t("role.support")}</SelectItem>
                      <SelectItem value="admin">{t("role.admin")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">{t("users.department")}</Label>
                  <Input
                    id="department"
                    value={editingUser.department || ""}
                    onChange={(e) => setEditingUser({ ...editingUser, department: e.target.value })}
                  />
                </div>
                <div className="flex justify-end space-x-2 pt-4">
                  <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                    {t("common.cancel")}
                  </Button>
                  <Button onClick={handleSaveUser} className="bg-orange-500 hover:bg-orange-600">
                    {t("common.save")}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
