"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Trash2,
  Plus,
  Edit2,
  Target,
  Search,
  Weight,
  AlertCircle,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useMutation, useQuery } from "@apollo/client";
import {
  CREATE_INDUCTION_QUANTITY,
  GET_INDUCTION_QUANTITIES,
  UPDATE_INDUCTION_QUANTITY,
  DELETE_INDUCTION_QUANTITY,
} from "@/graphql/inductionQuantities.graphql";
import { toast } from "sonner";

interface Quality {
  id: string;
  name: string;
  weightage: number;
}

interface InductionQuantity {
  __typename: string;
  id: string;
  name: string;
  weightage: number;
}

interface QueryData {
  inductionQuantities: InductionQuantity[];
}

interface CreateMutationData {
  createInductionQuantity: InductionQuantity;
}

interface UpdateMutationData {
  updateInductionQuantity: InductionQuantity;
}

interface DeleteMutationData {
  removeInductionQuantity: { 
    id: string;
    message: string;
  };
}

export default function QualitiesPage() {
  const [qualities, setQualities] = useState<Quality[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingQuality, setEditingQuality] = useState<Quality | null>(null);
  const [deletingQuality, setDeletingQuality] = useState<Quality | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [newQuality, setNewQuality] = useState<Omit<Quality, "id">>({
    name: "",
    weightage: 0,
  });

  // Query for fetching data
  const { data, loading, error, refetch } = useQuery<QueryData>(
    GET_INDUCTION_QUANTITIES,
    {
      errorPolicy: "all",
      notifyOnNetworkStatusChange: true,
    }
  );

  // Mutations
  const [
    createInductionQuantity,
    { loading: createLoading, error: createError },
  ] = useMutation<CreateMutationData>(CREATE_INDUCTION_QUANTITY, {
    onCompleted: (data) => {
      toast.success("Quality added successfully!");
      const newQualityData = {
        id: data.createInductionQuantity.id,
        name: data.createInductionQuantity.name,
        weightage: data.createInductionQuantity.weightage,
      };
      setQualities((prev) => [...prev, newQualityData]);
      setNewQuality({ name: "", weightage: 0 });
      setIsAddDialogOpen(false);
    },
    onError: (error) => {
      console.error("Error creating quality:", error);
      toast.error(`Failed to create quality: ${error.message}`);
    },
    refetchQueries: [{ query: GET_INDUCTION_QUANTITIES }],
  });

  const [
    updateInductionQuantity,
    { loading: updateLoading, error: updateError },
  ] = useMutation<UpdateMutationData>(UPDATE_INDUCTION_QUANTITY, {
    onCompleted: (data) => {
      toast.success("Quality updated successfully!");
      setQualities((prev) =>
        prev.map((q) =>
          q.id === data.updateInductionQuantity.id
            ? {
                id: data.updateInductionQuantity.id,
                name: data.updateInductionQuantity.name,
                weightage: data.updateInductionQuantity.weightage,
              }
            : q
        )
      );
      setEditingQuality(null);
      setIsEditDialogOpen(false);
    },
    onError: (error) => {
      console.error("Error updating quality:", error);
      toast.error(`Failed to update quality: ${error.message}`);
    },
  });

  const [
    deleteInductionQuantity,
    { loading: deleteLoading, error: deleteError },
  ] = useMutation<DeleteMutationData>(DELETE_INDUCTION_QUANTITY, {
    onCompleted: (data) => {
      toast.success("Quality deleted successfully!");
      setQualities((prev) => prev.filter((q) => q.id !== deletingId));
      setDeletingId(null);
      setDeletingQuality(null);
      setIsDeleteDialogOpen(false);
    },
    onError: (error) => {
      console.error("Error deleting quality:", error);
      toast.error(`Failed to delete quality: ${error.message}`);
      setDeletingId(null);
    },
  });

  // Initialize qualities from GraphQL data
  useEffect(() => {
    if (data?.inductionQuantities) {
      const formattedQualities: Quality[] = data.inductionQuantities.map(
        (item) => ({
          id: item.id,
          name: item.name,
          weightage: item.weightage,
        })
      );
      setQualities(formattedQualities);
    }
  }, [data]);

  // Show error toast for any mutation errors
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

  // Calculate total weightage
  const totalWeightage = qualities.reduce(
    (sum, quality) => sum + quality.weightage,
    0
  );

  // Calculate available weightage for new quality
  const availableWeightage = Math.max(0, 100 - totalWeightage);

  // Calculate available weightage when editing (excluding current quality)
  const getAvailableWeightageForEdit = (currentWeightage: number) => {
    return Math.max(0, 100 - (totalWeightage - currentWeightage));
  };

  // Filter qualities based on search term
  const filteredQualities = qualities.filter((quality) =>
    quality.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addQuality = async () => {
    if (!newQuality.name.trim() || newQuality.weightage <= 0) {
      toast.error("Please provide a valid name and weightage");
      return;
    }

    const newTotalWeightage = totalWeightage + newQuality.weightage;

    if (newTotalWeightage > 100) {
      toast.error(
        `Cannot add quality. This would exceed 100% total weightage. Available: ${availableWeightage}%`
      );
      return;
    }

    try {
      await createInductionQuantity({
        variables: {
          createInductionQuantityInput: {
            name: newQuality.name.trim(),
            weightage: newQuality.weightage,
          },
        },
      });
    } catch (error) {
      console.error("Mutation error:", error);
    }
  };

  const openDeleteDialog = (quality: Quality) => {
    setDeletingQuality(quality);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!deletingQuality) return;
    
    setDeletingId(deletingQuality.id);
    try {
      await deleteInductionQuantity({
        variables: {
          removeInductionQuantityId: deletingQuality.id,
        },
      });
    } catch (error) {
      console.error("Delete mutation error:", error);
      setDeletingId(null);
    }
  };

  const startEdit = (quality: Quality) => {
    setEditingQuality({ ...quality });
    setIsEditDialogOpen(true);
  };

  const saveEdit = async () => {
    if (!editingQuality) return;

    if (!editingQuality.name.trim() || editingQuality.weightage <= 0) {
      toast.error("Please provide a valid name and weightage");
      return;
    }

    const currentQuality = qualities.find((q) => q.id === editingQuality.id);
    if (!currentQuality) {
      toast.error("Quality not found");
      return;
    }

    const otherQualitiesTotal = totalWeightage - currentQuality.weightage;
    const newTotalWeightage = otherQualitiesTotal + editingQuality.weightage;

    if (newTotalWeightage > 100) {
      const maxAllowed = 100 - otherQualitiesTotal;
      toast.error(
        `Cannot save changes. Maximum allowed weightage for this quality: ${maxAllowed}%`
      );
      return;
    }

    try {
      await updateInductionQuantity({
        variables: {
          updateInductionQuantityInput: {
            id: editingQuality.id,
            name: editingQuality.name.trim(),
            weightage: editingQuality.weightage,
          },
        },
      });
    } catch (error) {
      console.error("Update mutation error:", error);
    }
  };

  const isWeightageValid = totalWeightage === 100;
  const canAddQualities = availableWeightage > 0;

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto p-6 max-w-7xl">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-muted-foreground">
                Loading induction qualities...
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
      <div className="min-h-screen bg-background">
        <div className="container mx-auto p-6 max-w-7xl">
          <Alert className="max-w-2xl mx-auto">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load induction qualities: {error.message}
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                className="ml-2"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Retry"
                )}
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 max-w-7xl">
        {/* Header Section */}
        <div className="bg-card rounded-xl shadow-sm border p-8 mb-8">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-muted rounded-lg">
                  <Target className="h-6 w-6 text-foreground" />
                </div>
                <h1 className="text-3xl font-bold text-foreground">
                  Induction Qualities
                </h1>
              </div>
              <p className="text-muted-foreground text-lg leading-relaxed max-w-2xl">
                Define and manage the core qualities you want to evaluate in
                your organization's selection process. Total weightage must
                equal 100%.
              </p>
            </div>

            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  size="lg"
                  className="flex items-center gap-2 px-6 py-3 rounded-lg shadow-md hover:shadow-lg transition-all"
                  disabled={!canAddQualities || createLoading}
                >
                  {createLoading ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : (
                    <Plus size={20} />
                  )}
                  {createLoading
                    ? "Adding..."
                    : canAddQualities
                    ? "Add New Quality"
                    : "Max Weightage Reached"}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle className="text-xl font-semibold">
                    Add New Quality
                  </DialogTitle>
                  <DialogDescription>
                    Define a new quality to evaluate candidates on during the
                    selection process.
                  </DialogDescription>
                </DialogHeader>

                {availableWeightage <= 0 && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Cannot add new qualities. Total weightage is already at
                      100%. Please edit existing qualities to free up weightage.
                    </AlertDescription>
                  </Alert>
                )}

                <div className="space-y-5 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium">
                      Quality Name
                    </Label>
                    <Input
                      id="name"
                      value={newQuality.name}
                      onChange={(e) =>
                        setNewQuality({ ...newQuality, name: e.target.value })
                      }
                      placeholder="e.g., Leadership, Problem Solving"
                      className="h-11"
                      disabled={availableWeightage <= 0 || createLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="weightage" className="text-sm font-medium">
                      Weightage (%)
                    </Label>
                    <Input
                      id="weightage"
                      type="number"
                      min="1"
                      max={availableWeightage}
                      value={newQuality.weightage || ""}
                      onChange={(e) =>
                        setNewQuality({
                          ...newQuality,
                          weightage: parseInt(e.target.value) || 0,
                        })
                      }
                      placeholder={`Max: ${availableWeightage}%`}
                      className="h-11"
                      disabled={availableWeightage <= 0 || createLoading}
                    />
                    <p className="text-xs text-muted-foreground">
                      Available weightage:{" "}
                      <span className="font-semibold">
                        {availableWeightage}%
                      </span>
                    </p>
                  </div>
                </div>
                <DialogFooter className="gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setIsAddDialogOpen(false)}
                    className="px-6"
                    disabled={createLoading}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={addQuality}
                    className="px-6"
                    disabled={
                      !newQuality.name.trim() ||
                      newQuality.weightage <= 0 ||
                      newQuality.weightage > availableWeightage ||
                      createLoading
                    }
                  >
                    {createLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Adding...
                      </>
                    ) : (
                      "Add Quality"
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Weightage Status Alert */}
        {!isWeightageValid && (
          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {totalWeightage > 100
                ? `Total weightage exceeds 100% by ${
                    totalWeightage - 100
                  }%. Please adjust quality weightages.`
                : `Total weightage is ${totalWeightage}%. You need to allocate ${
                    100 - totalWeightage
                  }% more to reach 100%.`}
            </AlertDescription>
          </Alert>
        )}

        {/* Search and Stats Section */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
          <div className="flex items-center gap-6">
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">
                {qualities.length}
              </span>{" "}
              total qualities
            </p>
            <div className="flex items-center gap-2">
              <Weight className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Total weightage:{" "}
                <span
                  className={`font-semibold ${
                    isWeightageValid
                      ? "text-green-600"
                      : totalWeightage > 100
                      ? "text-red-600"
                      : "text-orange-600"
                  }`}
                >
                  {totalWeightage}%
                </span>
                {isWeightageValid && (
                  <span className="ml-1 text-green-600">✓</span>
                )}
              </p>
            </div>
            {searchTerm && (
              <p className="text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">
                  {filteredQualities.length}
                </span>{" "}
                matching results
              </p>
            )}
          </div>

          <div className="relative max-w-sm w-full md:w-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search qualities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-10"
            />
          </div>
        </div>

        {/* Qualities Grid */}
        {filteredQualities.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {filteredQualities.map((quality) => (
              <Card
                key={quality.id}
                className="bg-card shadow-sm hover:shadow-lg hover:border-primary/20 transition-all duration-200 group"
              >
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-semibold text-sm">
                          {qualities.findIndex((q) => q.id === quality.id) + 1}
                        </div>
                        <CardTitle className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                          {quality.name}
                        </CardTitle>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {quality.weightage}% weightage
                      </Badge>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => startEdit(quality)}
                        className="h-8 w-8 p-0 hover:bg-muted"
                        disabled={updateLoading}
                      >
                        {updateLoading ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <Edit2 size={14} />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openDeleteDialog(quality)}
                        className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                        disabled={deletingId === quality.id}
                      >
                        {deletingId === quality.id ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <Trash2 size={14} />
                        )}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="bg-card shadow-sm">
            <CardContent className="text-center py-16">
              <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                <Target className="h-8 w-8 text-muted-foreground" />
              </div>
              {searchTerm ? (
                <>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    No matching qualities found
                  </h3>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    Try adjusting your search terms or add a new quality that
                    matches your criteria.
                  </p>
                  <div className="flex gap-3 justify-center">
                    <Button variant="outline" onClick={() => setSearchTerm("")}>
                      Clear Search
                    </Button>
                    <Dialog
                      open={isAddDialogOpen}
                      onOpenChange={setIsAddDialogOpen}
                    >
                      <DialogTrigger asChild>
                        <Button disabled={!canAddQualities || createLoading}>
                          <Plus size={16} className="mr-2" />
                          Add Quality
                        </Button>
                      </DialogTrigger>
                    </Dialog>
                  </div>
                </>
              ) : (
                <>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    No qualities defined yet
                  </h3>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    Add your first quality to get started with the selection
                    process and begin evaluating candidates.
                  </p>
                  <Dialog
                    open={isAddDialogOpen}
                    onOpenChange={setIsAddDialogOpen}
                  >
                    <DialogTrigger asChild>
                      <Button disabled={createLoading}>
                        <Plus size={16} className="mr-2" />
                        Add Your First Quality
                      </Button>
                    </DialogTrigger>
                  </Dialog>
                </>
              )}
            </CardContent>
          </Card>
        )}

        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <div className="flex flex-col items-center space-y-4 p-6">
              {/* Animated Warning Icon */}
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center animate-pulse">
                  <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
                </div>
                <div className="absolute inset-0 w-16 h-16 rounded-full bg-red-200 dark:bg-red-800/20 animate-ping opacity-75"></div>
              </div>

              {/* Title and Description */}
              <div className="text-center space-y-2">
                <h3 className="text-lg font-semibold text-foreground">
                  Delete Quality
                </h3>
                <p className="text-sm text-muted-foreground">
                  Are you sure you want to delete{" "}
                  <span className="font-semibold text-foreground">
                    "{deletingQuality?.name}"
                  </span>
                  ?
                </p>
                <p className="text-xs text-muted-foreground">
                  This action cannot be undone. The quality and its{" "}
                  <span className="font-medium">{deletingQuality?.weightage}% weightage</span>{" "}
                  will be permanently removed.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 w-full pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsDeleteDialogOpen(false);
                    setDeletingQuality(null);
                  }}
                  className="flex-1"
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

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold">
                Edit Quality
              </DialogTitle>
              <DialogDescription>
                Update the quality name and weightage.
              </DialogDescription>
            </DialogHeader>
            {editingQuality && (
              <div className="space-y-5 py-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name" className="text-sm font-medium">
                    Quality Name
                  </Label>
                  <Input
                    id="edit-name"
                    value={editingQuality.name}
                    onChange={(e) =>
                      setEditingQuality({
                        ...editingQuality,
                        name: e.target.value,
                      })
                    }
                    className="h-11"
                    disabled={updateLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="edit-weightage"
                    className="text-sm font-medium"
                  >
                    Weightage (%)
                  </Label>
                  <Input
                    id="edit-weightage"
                    type="number"
                    min="1"
                    max={
                      editingQuality 
                        ? getAvailableWeightageForEdit(
                            qualities.find((q) => q.id === editingQuality.id)?.weightage || 0
                          )
                        : 100
                    }
                    value={editingQuality.weightage || ""}
                    onChange={(e) =>
                      setEditingQuality({
                        ...editingQuality,
                        weightage: parseInt(e.target.value) || 0,
                      })
                    }
                    className="h-11"
                    disabled={updateLoading}
                  />
                  <p className="text-xs text-muted-foreground">
                    Available weightage:{" "}
                    <span className="font-semibold">
                      {editingQuality 
                        ? getAvailableWeightageForEdit(
                            qualities.find((q) => q.id === editingQuality.id)?.weightage || 0
                          )
                        : 0}
                      %
                    </span>
                  </p>
                </div>
              </div>
            )}
            <DialogFooter className="gap-3">
              <Button
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
                className="px-6"
                disabled={updateLoading}
              >
                Cancel
              </Button>
              <Button
                onClick={saveEdit}
                className="px-6"
                disabled={
                  !editingQuality?.name.trim() ||
                  (editingQuality?.weightage || 0) <= 0 ||
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
