"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Trash2,
  Plus,
  Edit2,
  Users,
  Search,
  Loader2,
  Mail,
  AlertTriangle,
  Star,
  CheckCircle,
  Clock,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { useMutation, useQuery } from "@apollo/client";
import {
  CREATE_INDUCTION_CONTESTANT,
  DELETE_INDUCTION_CONTESTANT,
  GET_INDUCTION_CONTESTANTS,
  UPDATE_INDUCTION_CONTESTANT,
} from "@/graphql/inductionContestants.graphql";

interface Contestant {
  id: string;
  name: string;
  email: string;
  evaluationStatus?: "evaluated" | "pending" | "in-progress";
  totalScore?: number;
}

interface InductionContestant {
  __typename: string;
  id: string;
  name: string;
  email: string;
  finalScore?: number | null;
}

interface QueryData {
  inductionContestants: InductionContestant[];
}

interface CreateMutationData {
  createInductionContestant: InductionContestant;
}

interface UpdateMutationData {
  updateInductionContestant: InductionContestant;
}

interface DeleteMutationData {
  removeInductionContestant: {
    id: string;
    message: string;
  };
}

export default function ContestantsPage() {
  const router = useRouter();
  const [contestants, setContestants] = useState<Contestant[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingContestant, setEditingContestant] = useState<Contestant | null>(null);
  const [deletingContestant, setDeletingContestant] = useState<Contestant | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [newContestant, setNewContestant] = useState<Omit<Contestant, "id">>({
    name: "",
    email: "",
    evaluationStatus: "pending",
  });

  // GraphQL Query for contestants
  const {
    data,
    loading: contestantsLoading,
    error: queryError,
    refetch,
  } = useQuery<QueryData>(GET_INDUCTION_CONTESTANTS, {
    errorPolicy: "all",
    notifyOnNetworkStatusChange: true,
    fetchPolicy: "cache-and-network",
  });

  // GraphQL Mutations
  const [createContestant, { loading: createLoading, error: createError }] = 
    useMutation<CreateMutationData>(CREATE_INDUCTION_CONTESTANT, {
      onCompleted: (data) => {
        const formattedContestant: Contestant = {
          id: data.createInductionContestant.id,
          name: data.createInductionContestant.name,
          email: data.createInductionContestant.email,
          totalScore: data.createInductionContestant.finalScore || undefined,
          evaluationStatus: data.createInductionContestant.finalScore !== null ? "evaluated" : "pending",
        };
        
        setContestants((prev) => [...prev, formattedContestant]);
        resetNewContestant();
        setIsAddDialogOpen(false);
        toast.success("Contestant added successfully!");
      },
      onError: (error) => {
        console.error("Error creating contestant:", error);
        toast.error(`Failed to add contestant: ${error.message}`);
      },
      refetchQueries: [{ query: GET_INDUCTION_CONTESTANTS }],
    });

  const [updateContestant, { loading: updateLoading, error: updateError }] = 
    useMutation<UpdateMutationData>(UPDATE_INDUCTION_CONTESTANT, {
      onCompleted: (data) => {
        const formattedContestant: Contestant = {
          id: data.updateInductionContestant.id,
          name: data.updateInductionContestant.name,
          email: data.updateInductionContestant.email,
          totalScore: data.updateInductionContestant.finalScore || undefined,
          evaluationStatus: data.updateInductionContestant.finalScore !== null ? "evaluated" : "pending",
        };

        setContestants((prev) =>
          prev.map((c) => (c.id === formattedContestant.id ? formattedContestant : c))
        );
        setEditingContestant(null);
        setIsEditDialogOpen(false);
        toast.success("Contestant updated successfully!");
      },
      onError: (error) => {
        console.error("Error updating contestant:", error);
        toast.error(`Failed to update contestant: ${error.message}`);
      },
    });

  const [deleteContestant, { loading: deleteLoading, error: deleteError }] = 
    useMutation<DeleteMutationData>(DELETE_INDUCTION_CONTESTANT, {
      onCompleted: (data) => {
        setContestants((prev) => prev.filter((c) => c.id !== data.removeInductionContestant.id));
        setDeletingContestant(null);
        setIsDeleteDialogOpen(false);
        toast.success("Contestant deleted successfully!");
      },
      onError: (error) => {
        console.error("Error deleting contestant:", error);
        toast.error(`Failed to delete contestant: ${error.message}`);
      },
      refetchQueries: [{ query: GET_INDUCTION_CONTESTANTS }],
    });

  // Initialize contestants from GraphQL data
  useEffect(() => {
    if (data?.inductionContestants) {
      const formattedContestants: Contestant[] = data.inductionContestants.map(
        (item) => ({
          id: item.id,
          name: item.name,
          email: item.email,
          totalScore: item.finalScore || undefined,
          evaluationStatus: item.finalScore !== null ? "evaluated" : "pending",
        })
      );
      setContestants(formattedContestants);
    }
  }, [data]);

  // Show error toasts for mutation errors
  useEffect(() => {
    if (createError) {
      toast.error(`Create error: ${createError.message}`);
    }
    if (updateError) {
      toast.error(`Update error: ${updateError.message}`);
    }
    if (deleteError) {
      toast.error(`Delete error: ${deleteError.message}`);
    }
  }, [createError, updateError, deleteError]);

  // Filter contestants based on search term
  const filteredContestants = contestants.filter(
    (contestant) =>
      contestant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contestant.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const resetNewContestant = () => {
    setNewContestant({
      name: "",
      email: "",
      evaluationStatus: "pending",
    });
  };

  const addContestant = async () => {
    if (!newContestant.name.trim() || !newContestant.email.trim()) {
      toast.error("Please provide both name and email");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newContestant.email)) {
      toast.error("Please provide a valid email address");
      return;
    }

    // Check for duplicate email
    if (contestants.some((c) => c.email.toLowerCase() === newContestant.email.toLowerCase())) {
      toast.error("A contestant with this email already exists");
      return;
    }

    try {
      await createContestant({
        variables: {
          createInductionContestantInput: {
            name: newContestant.name.trim(),
            email: newContestant.email.trim(),
          },
        },
      });
    } catch (error) {
      // Error is handled by onError callback
      console.error("Mutation error:", error);
    }
  };

  const openDeleteDialog = (contestant: Contestant) => {
    setDeletingContestant(contestant);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!deletingContestant) return;

    try {
      await deleteContestant({
        variables: {
          removeInductionContestantId: deletingContestant.id,
        },
      });
    } catch (error) {
      // Error is handled by onError callback
      console.error("Delete mutation error:", error);
    }
  };

  const startEdit = (contestant: Contestant) => {
    setEditingContestant({ ...contestant });
    setIsEditDialogOpen(true);
  };

  const saveEdit = async () => {
    if (!editingContestant) return;

    if (!editingContestant.name.trim() || !editingContestant.email.trim()) {
      toast.error("Please provide both name and email");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(editingContestant.email)) {
      toast.error("Please provide a valid email address");
      return;
    }

    // Check for duplicate email (excluding current contestant)
    if (
      contestants.some(
        (c) =>
          c.id !== editingContestant.id &&
          c.email.toLowerCase() === editingContestant.email.toLowerCase()
      )
    ) {
      toast.error("A contestant with this email already exists");
      return;
    }

    try {
      await updateContestant({
        variables: {
          updateInductionContestantInput: {
            id: editingContestant.id,
            name: editingContestant.name.trim(),
            email: editingContestant.email.trim(),
          },
        },
      });
    } catch (error) {
      // Error is handled by onError callback
      console.error("Update mutation error:", error);
    }
  };

  const handleRetryQuery = async () => {
    try {
      await refetch();
      toast.success("Data refreshed successfully!");
    } catch (error) {
      toast.error("Failed to refresh data. Please try again.");
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getEvaluationStatusBadge = (status?: string, score?: number) => {
    switch (status) {
      case "evaluated":
        return (
          <div className="flex items-center gap-2">
            <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
              <CheckCircle className="h-3 w-3 mr-1" />
              Evaluated
            </Badge>
            {score && (
              <span className="text-sm font-medium text-foreground">
                {score}/10
              </span>
            )}
          </div>
        );
      case "in-progress":
        return (
          <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
            <Clock className="h-3 w-3 mr-1" />
            In Progress
          </Badge>
        );
      case "pending":
      default:
        return (
          <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
    }
  };

  const handleEvaluate = (contestantId: string) => {
    router.push(`/inductions/contestants/${contestantId}/evaluate`);
  };

  // Calculate stats
  const evaluatedCount = contestants.filter((c) => c.evaluationStatus === "evaluated").length;
  const pendingCount = contestants.filter((c) => c.evaluationStatus === "pending").length;
  const inProgressCount = contestants.filter((c) => c.evaluationStatus === "in-progress").length;

  // Combined loading state for any mutation
  const isLoading = createLoading || updateLoading || deleteLoading;

  // Loading state
  if (contestantsLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto p-8 max-w-7xl">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center space-y-4">
              <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-foreground">
                  Loading Contestants
                </h3>
                <p className="text-muted-foreground">
                  Fetching contestant data from the server...
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (queryError) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto p-8 max-w-7xl">
          <div className="flex items-center justify-center min-h-[60vh]">
            <Card className="w-full max-w-md shadow-lg border-2">
              <CardContent className="p-8 text-center space-y-6">
                <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                  <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-foreground">
                    Failed to Load Contestants
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {queryError.message ||
                      "An unexpected error occurred while loading contestants."}
                  </p>
                </div>

                <div className="flex gap-3 justify-center">
                  <Button
                    variant="outline"
                    onClick={() => router.push("/inductions")}
                    className="px-6"
                  >
                    Go Back
                  </Button>
                  <Button
                    onClick={handleRetryQuery}
                    className="px-6"
                    disabled={contestantsLoading}
                  >
                    {contestantsLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Retrying...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Retry
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-8 max-w-7xl">
        {/* Header Section - Improved */}
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-6 mb-10">
          <div className="space-y-2">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <h1 className="text-4xl font-bold text-foreground">
                  Induction Contestants
                </h1>
              </div>
              <div className="flex gap-2">
                <Badge variant="secondary" className="text-sm font-medium">
                  {contestants.length} total
                </Badge>
                <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 text-sm">
                  {evaluatedCount} evaluated
                </Badge>
                <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400 text-sm">
                  {pendingCount} pending
                </Badge>
              </div>
            </div>
            <p className="text-muted-foreground text-lg max-w-2xl leading-relaxed">
              Manage and evaluate all contestants participating in your organization's
              induction process.
            </p>
          </div>

          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button
                size="lg"
                className="flex items-center gap-2 px-8 py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
                disabled={isLoading}
              >
                {createLoading ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : (
                  <Plus size={20} />
                )}
                {createLoading ? "Adding..." : "Add Contestant"}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader className="space-y-3">
                <DialogTitle className="text-2xl font-semibold">
                  Add New Contestant
                </DialogTitle>
                <DialogDescription className="text-base">
                  Add a new contestant to the induction process.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 py-6">
                <div className="space-y-3">
                  <Label htmlFor="name" className="text-sm font-medium text-foreground">
                    Full Name *
                  </Label>
                  <Input
                    id="name"
                    value={newContestant.name}
                    onChange={(e) =>
                      setNewContestant({
                        ...newContestant,
                        name: e.target.value,
                      })
                    }
                    placeholder="Enter full name"
                    className="h-12 border-2 focus:border-primary"
                    disabled={createLoading}
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="email" className="text-sm font-medium text-foreground">
                    Email Address *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={newContestant.email}
                    onChange={(e) =>
                      setNewContestant({
                        ...newContestant,
                        email: e.target.value,
                      })
                    }
                    placeholder="Enter email address"
                    className="h-12 border-2 focus:border-primary"
                    disabled={createLoading}
                  />
                </div>
              </div>

              <DialogFooter className="gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsAddDialogOpen(false);
                    resetNewContestant();
                  }}
                  className="px-6 py-2 border-2"
                  disabled={createLoading}
                >
                  Cancel
                </Button>
                <Button
                  onClick={addContestant}
                  className="px-6 py-2 bg-primary hover:bg-primary/90"
                  disabled={
                    !newContestant.name.trim() ||
                    !newContestant.email.trim() ||
                    createLoading
                  }
                >
                  {createLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Adding...
                    </>
                  ) : (
                    "Add Contestant"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search and Controls - Improved Layout */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div className="text-sm text-muted-foreground">
            Showing{" "}
            <span className="font-semibold text-foreground">
              {filteredContestants.length}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-foreground">
              {contestants.length}
            </span>{" "}
            {filteredContestants.length === 1 ? "contestant" : "contestants"}
            {searchTerm && (
              <span>
                {" "}
                matching <span className="font-medium">"{searchTerm}"</span>
              </span>
            )}
          </div>

          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-11 border-2 focus:border-primary"
            />
          </div>
        </div>

        {/* Enhanced Table */}
        {filteredContestants.length > 0 ? (
          <Card className="shadow-lg border-2">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-b-2 bg-muted/50">
                    <TableHead className="w-16 py-4 px-6 font-semibold text-foreground">
                      #
                    </TableHead>
                    <TableHead className="py-4 px-6 font-semibold text-foreground">
                      Contestant
                    </TableHead>
                    <TableHead className="py-4 px-6 font-semibold text-foreground">
                      Email
                    </TableHead>
                    <TableHead className="py-4 px-6 font-semibold text-foreground">
                      Status
                    </TableHead>
                    <TableHead className="w-48 py-4 px-6 text-right font-semibold text-foreground">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredContestants.map((contestant, index) => (
                    <TableRow
                      key={contestant.id}
                      className="hover:bg-muted/30 transition-colors duration-150 border-b last:border-b-0"
                    >
                      <TableCell className="py-4 px-6 font-medium text-muted-foreground">
                        {index + 1}
                      </TableCell>
                      <TableCell className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10 border-2 border-primary/20">
                            <AvatarFallback className="bg-primary text-primary-foreground text-sm font-medium">
                              {getInitials(contestant.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="font-medium text-foreground text-base">
                            {contestant.name}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-4 px-6">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Mail className="h-4 w-4" />
                          <span className="text-base">{contestant.email}</span>
                        </div>
                      </TableCell>
                      <TableCell className="py-4 px-6">
                        {getEvaluationStatusBadge(
                          contestant.evaluationStatus,
                          contestant.totalScore
                        )}
                      </TableCell>
                      <TableCell className="py-4 px-6">
                        <div className="flex gap-2 justify-end">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEvaluate(contestant.id)}
                            className="h-9 w-9 p-0 hover:bg-green-100 hover:text-green-600 transition-colors"
                            disabled={isLoading}
                            title="Evaluate Contestant"
                          >
                            <Star size={16} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => startEdit(contestant)}
                            className="h-9 w-9 p-0 hover:bg-blue-100 hover:text-blue-600 transition-colors"
                            disabled={isLoading}
                            title="Edit Contestant"
                          >
                            {updateLoading && editingContestant?.id === contestant.id ? (
                              <Loader2 size={14} className="animate-spin" />
                            ) : (
                              <Edit2 size={16} />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openDeleteDialog(contestant)}
                            className="h-9 w-9 p-0 hover:bg-red-100 hover:text-red-600 transition-colors"
                            disabled={isLoading}
                            title="Delete Contestant"
                          >
                            {deleteLoading && deletingContestant?.id === contestant.id ? (
                              <Loader2 size={14} className="animate-spin" />
                            ) : (
                              <Trash2 size={16} />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ) : (
          <Card className="shadow-lg border-2">
            <CardContent className="text-center py-20">
              <div className="mx-auto w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-6">
                <Users className="h-10 w-10 text-muted-foreground" />
              </div>
              {searchTerm ? (
                <>
                  <h3 className="text-xl font-semibold text-foreground mb-3">
                    No matching contestants found
                  </h3>
                  <p className="text-muted-foreground mb-8 max-w-md mx-auto text-base">
                    Try adjusting your search terms or add a new contestant.
                  </p>
                  <div className="flex gap-4 justify-center">
                    <Button
                      variant="outline"
                      onClick={() => setSearchTerm("")}
                      className="px-6 py-2 border-2"
                    >
                      Clear Search
                    </Button>
                    <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                      <DialogTrigger asChild>
                        <Button disabled={isLoading} className="px-6 py-2">
                          <Plus size={16} className="mr-2" />
                          Add Contestant
                        </Button>
                      </DialogTrigger>
                    </Dialog>
                  </div>
                </>
              ) : (
                <>
                  <h3 className="text-xl font-semibold text-foreground mb-3">
                    No contestants added yet
                  </h3>
                  <p className="text-muted-foreground mb-8 max-w-md mx-auto text-base">
                    Start building your contestant pool by adding the first participant
                    to your induction process.
                  </p>
                  <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                    <DialogTrigger asChild>
                      <Button disabled={isLoading} size="lg" className="px-8 py-3">
                        <Plus size={18} className="mr-2" />
                        Add Your First Contestant
                      </Button>
                    </DialogTrigger>
                  </Dialog>
                </>
              )}
            </CardContent>
          </Card>
        )}

        {/* Delete Confirmation Dialog - Enhanced */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <div className="flex flex-col items-center space-y-6 p-6">
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center animate-pulse">
                  <AlertTriangle className="h-10 w-10 text-red-600 dark:text-red-400" />
                </div>
                <div className="absolute inset-0 w-20 h-20 rounded-full bg-red-200 dark:bg-red-800/20 animate-ping opacity-75"></div>
              </div>

              <div className="text-center space-y-3">
                <h3 className="text-xl font-semibold text-foreground">
                  Delete Contestant
                </h3>
                <p className="text-muted-foreground">
                  Are you sure you want to delete{" "}
                  <span className="font-semibold text-foreground">
                    "{deletingContestant?.name}"
                  </span>
                  ?
                </p>
                <p className="text-sm text-muted-foreground">
                  This action cannot be undone and will also delete their evaluation data.
                </p>
              </div>

              <div className="flex gap-4 w-full pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsDeleteDialogOpen(false);
                    setDeletingContestant(null);
                  }}
                  className="flex-1 border-2"
                  disabled={deleteLoading}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={confirmDelete}
                  className="flex-1"
                  disabled={deleteLoading}
                >
                  {deleteLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Dialog - Enhanced */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader className="space-y-3">
              <DialogTitle className="text-2xl font-semibold">
                Edit Contestant
              </DialogTitle>
              <DialogDescription className="text-base">
                Update contestant information.
              </DialogDescription>
            </DialogHeader>

            {editingContestant && (
              <div className="space-y-6 py-6">
                <div className="space-y-3">
                  <Label htmlFor="edit-name" className="text-sm font-medium text-foreground">
                    Full Name *
                  </Label>
                  <Input
                    id="edit-name"
                    value={editingContestant.name}
                    onChange={(e) =>
                      setEditingContestant({
                        ...editingContestant,
                        name: e.target.value,
                      })
                    }
                    placeholder="Enter full name"
                    className="h-12 border-2 focus:border-primary"
                    disabled={updateLoading}
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="edit-email" className="text-sm font-medium text-foreground">
                    Email Address *
                  </Label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={editingContestant.email}
                    onChange={(e) =>
                      setEditingContestant({
                        ...editingContestant,
                        email: e.target.value,
                      })
                    }
                    placeholder="Enter email address"
                    className="h-12 border-2 focus:border-primary"
                    disabled={updateLoading}
                  />
                </div>
              </div>
            )}

            <DialogFooter className="gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditDialogOpen(false);
                  setEditingContestant(null);
                }}
                className="px-6 py-2 border-2"
                disabled={updateLoading}
              >
                Cancel
              </Button>
              <Button
                onClick={saveEdit}
                className="px-6 py-2 bg-primary hover:bg-primary/90"
                disabled={
                  !editingContestant?.name.trim() ||
                  !editingContestant?.email.trim() ||
                  updateLoading
                }
              >
                {updateLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
