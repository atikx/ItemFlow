"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Trash2,
  Building2,
  Mail,
  Briefcase,
  Search,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { Department } from "@/types/departments.types";
import { useMutation, useQuery } from "@apollo/client";
import {
  CREATE_DEPARTMENT,
  GET_DEPARTMENTS,
  REMOVE_DEPARTMENT,
} from "@/graphql/departments.graphql";

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "" });
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddLoading, setIsAddLoading] = useState(false);
  const [deletingDepartmentId, setDeletingDepartmentId] = useState<
    string | null
  >(null);

  // Query for fetching departments
  const { data, loading, error, refetch } = useQuery(GET_DEPARTMENTS);

  // Mutations
  const [createDepartment] = useMutation(CREATE_DEPARTMENT, {
    refetchQueries: [{ query: GET_DEPARTMENTS }],
  });

  const [deleteDepartment] = useMutation(REMOVE_DEPARTMENT, {
    refetchQueries: [{ query: GET_DEPARTMENTS }],
  });

  // Update local state when GraphQL data changes
  useEffect(() => {
    if (data?.departments) {
      setDepartments(data.departments);
    }
  }, [data]);

  const handleAddDepartment = async () => {
    if (!formData.name.trim() || !formData.email.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsAddLoading(true);

    try {
      const res = await createDepartment({
        variables: {
          createDepartmentInput: {
            name: formData.name.trim(),
            email: formData.email.trim(),
          },
        },
      });

      console.log("Department created:", res.data.createDepartment);
      setFormData({ name: "", email: "" });
      setIsAddDialogOpen(false);
      toast.success("Department added successfully!");
    } catch (error: any) {
      console.error("Error adding department:", error);
      const errorMessage =
        error?.message || "Failed to add department. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsAddLoading(false);
    }
  };

  const handleDeleteDepartment = async (id: string) => {
    setDeletingDepartmentId(id);
    console.log(id);
    try {
      await deleteDepartment({
        variables: { removeDepartmentId: id },
      });
      toast.success("Department deleted successfully!");
    } catch (error: any) {
      console.error("Error deleting department:", error);
      const errorMessage =
        error?.message || "Failed to delete department. Please try again.";
      toast.error(errorMessage);
    } finally {
      setDeletingDepartmentId(null);
    }
  };

  const resetForm = () => {
    setFormData({ name: "", email: "" });
  };

  const handleDialogClose = (open: boolean) => {
    if (!open && !isAddLoading) {
      setIsAddDialogOpen(false);
      resetForm();
    } else if (open) {
      setIsAddDialogOpen(true);
    }
  };

  // Filter departments based on search term
  const filteredDepartments = departments.filter(
    (dept) =>
      dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dept.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
        <div className="container mx-auto py-8 px-4">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-lg text-muted-foreground">
                Loading departments...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
        <div className="container mx-auto py-8 px-4">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center space-y-4">
              <div className="p-4 bg-destructive/10 rounded-full w-fit mx-auto">
                <AlertCircle className="h-8 w-8 text-destructive" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Failed to load departments
                </h3>
                <p className="text-muted-foreground mb-4">{error.message}</p>
                <Button onClick={() => refetch()} size="lg">
                  <Loader2 className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <div className="container mx-auto py-8 px-4">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary rounded-xl shadow-lg">
                <Building2 className="h-8 w-8 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">
                  Departments
                </h1>
                <p className="text-muted-foreground mt-1">
                  Manage your organization's departments
                </p>
              </div>
            </div>

            <Dialog open={isAddDialogOpen} onOpenChange={handleDialogClose}>
              <DialogTrigger asChild>
                <Button size="lg" className="shadow-lg" onClick={resetForm}>
                  <Plus className="h-5 w-5 mr-2" />
                  Add Department
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-xl">
                    Add New Department
                  </DialogTitle>
                  <DialogDescription>
                    Create a new department for your organization.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Department Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder="Enter department name"
                      disabled={isAddLoading}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      placeholder="Enter department email"
                      disabled={isAddLoading}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => handleDialogClose(false)}
                    disabled={isAddLoading}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleAddDepartment} disabled={isAddLoading}>
                    {isAddLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      "Add Department"
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Search and Stats */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search departments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-sm">
                <Briefcase className="h-3 w-3 mr-1" />
                {filteredDepartments.length} Departments
              </Badge>
            </div>
          </div>
        </div>

        {/* Content Section */}
        {filteredDepartments.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-card/60 backdrop-blur-sm rounded-2xl p-12 border shadow-sm max-w-md mx-auto">
              <div className="p-4 bg-muted rounded-full w-fit mx-auto mb-6">
                <Building2 className="h-12 w-12 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-card-foreground mb-3">
                {searchTerm ? "No departments found" : "No departments yet"}
              </h3>
              <p className="text-muted-foreground mb-6">
                {searchTerm
                  ? "Try adjusting your search terms"
                  : "Get started by creating your first department"}
              </p>
              {!searchTerm && (
                <Dialog open={isAddDialogOpen} onOpenChange={handleDialogClose}>
                  <DialogTrigger asChild>
                    <Button size="lg" onClick={resetForm}>
                      <Plus className="h-5 w-5 mr-2" />
                      Add Your First Department
                    </Button>
                  </DialogTrigger>
                </Dialog>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDepartments.map((department) => (
              <Card
                key={department.id}
                className="group hover:shadow-xl transition-all duration-300 bg-card/80 backdrop-blur-sm hover:bg-card/90"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-muted rounded-lg">
                        <Building2 className="h-5 w-5 text-primary" />
                      </div>
                      <CardTitle className="text-lg font-semibold text-card-foreground group-hover:text-primary transition-colors">
                        {department.name}
                      </CardTitle>
                    </div>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                          disabled={deletingDepartmentId === department.id}
                        >
                          {deletingDepartmentId === department.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Department</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete{" "}
                            <strong>{department.name}</strong>? This action
                            cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel
                            disabled={deletingDepartmentId === department.id}
                          >
                            Cancel
                          </AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() =>
                              handleDeleteDepartment(department.id)
                            }
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            disabled={deletingDepartmentId === department.id}
                          >
                            {deletingDepartmentId === department.id ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Deleting...
                              </>
                            ) : (
                              "Delete"
                            )}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <span className="truncate">{department.email}</span>
                  </div>

                  <div className="mt-4 pt-4 border-t">
                    <Badge
                      variant="secondary"
                      className="bg-secondary/50 text-secondary-foreground border-border"
                    >
                      Active
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
