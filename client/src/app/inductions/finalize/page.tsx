"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Users,
  CheckCircle,
  X,
  TrendingUp,
  Filter,
  Download,
  Mail,
  Search,
  Loader2,
  AlertCircle,
  Star,
  Calendar,
  FileText,
  UserCheck,
  UserX,
  Eye,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { useQuery } from "@apollo/client";
import { GET_INDUCTION_CONTESTANTS } from "@/graphql/inductionContestants.graphql";

interface Contestant {
  id: string;
  name: string;
  email: string;
  finalScore: number;
  evaluationStatus: "evaluated";
  selectionStatus?: "pending" | "selected" | "rejected";
  selectedAt?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  evaluatedAt: string;
}

interface ContestantsData {
  inductionContestants: {
    id: string;
    name: string;
    email: string;
    finalScore: number | null;
  }[];
}

interface SelectionStats {
  total: number;
  selected: number;
  rejected: number;
  pending: number;
  averageScore: number;
  averageSelectedScore: number;
}

export default function SelectionPage() {
  const router = useRouter();
  
  // State management
  const [contestants, setContestants] = useState<Contestant[]>([]);
  const [selectedContestantIds, setSelectedContestantIds] = useState<string[]>([]);
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "selected" | "rejected">("all");
  const [minScoreThreshold, setMinScoreThreshold] = useState([7.0]);
  const [maxScoreThreshold, setMaxScoreThreshold] = useState([10.0]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "score" | "date">("score");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  
  // Dialog states
  const [isSelectDialogOpen, setIsSelectDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [isBulkDialogOpen, setIsBulkDialogOpen] = useState(false);
  const [isFinalizeDialogOpen, setIsFinalizeDialogOpen] = useState(false);
  
  // Selection states
  const [selectingContestant, setSelectingContestant] = useState<Contestant | null>(null);
  const [rejectingContestant, setRejectingContestant] = useState<Contestant | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [bulkAction, setBulkAction] = useState<"select" | "reject">("select");
  
  // Loading states for simulated actions
  const [selectLoading, setSelectLoading] = useState(false);
  const [rejectLoading, setRejectLoading] = useState(false);
  const [bulkLoading, setBulkLoading] = useState(false);

  // GraphQL Query for contestants (only this one uses real GraphQL)
  const {
    data: contestantsData,
    loading: contestantsLoading,
    error: contestantsError,
    refetch,
  } = useQuery<ContestantsData>(GET_INDUCTION_CONTESTANTS, {
    errorPolicy: "all",
    notifyOnNetworkStatusChange: true,
    fetchPolicy: "cache-and-network",
  });

  // Initialize contestants from GraphQL data and filter only evaluated ones
  useEffect(() => {
    if (contestantsData?.inductionContestants) {
      // Filter only contestants that have been evaluated (have finalScore)
      const evaluatedContestants: Contestant[] = contestantsData.inductionContestants
        .filter(contestant => contestant.finalScore !== null)
        .map(contestant => ({
          id: contestant.id,
          name: contestant.name,
          email: contestant.email,
          finalScore: contestant.finalScore!,
          evaluationStatus: "evaluated" as const,
          selectionStatus: "pending" as const, // Default to pending
          evaluatedAt: new Date().toISOString(), // Mock date
        }));
      
      setContestants(evaluatedContestants);
    }
  }, [contestantsData]);

  // Calculate statistics
  const stats: SelectionStats = {
    total: contestants.length,
    selected: contestants.filter(c => c.selectionStatus === "selected").length,
    rejected: contestants.filter(c => c.selectionStatus === "rejected").length,
    pending: contestants.filter(c => c.selectionStatus === "pending" || !c.selectionStatus).length,
    averageScore: contestants.length > 0 
      ? contestants.reduce((sum, c) => sum + c.finalScore, 0) / contestants.length 
      : 0,
    averageSelectedScore: contestants.filter(c => c.selectionStatus === "selected").length > 0
      ? contestants.filter(c => c.selectionStatus === "selected")
          .reduce((sum, c) => sum + c.finalScore, 0) / 
        contestants.filter(c => c.selectionStatus === "selected").length
      : 0,
  };

  // Filter and sort contestants
  const filteredContestants = contestants
    .filter(contestant => {
      // Status filter
      if (filterStatus !== "all") {
        const status = contestant.selectionStatus || "pending";
        if (status !== filterStatus) return false;
      }
      
      // Score filter
      if (contestant.finalScore < minScoreThreshold[0] || contestant.finalScore > maxScoreThreshold[0]) {
        return false;
      }
      
      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        return (
          contestant.name.toLowerCase().includes(searchLower) ||
          contestant.email.toLowerCase().includes(searchLower)
        );
      }
      
      return true;
    })
    .sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case "name":
          comparison = a.name.localeCompare(b.name);
          break;
        case "score":
          comparison = a.finalScore - b.finalScore;
          break;
        case "date":
          comparison = new Date(a.evaluatedAt).getTime() - new Date(b.evaluatedAt).getTime();
          break;
      }
      
      return sortOrder === "asc" ? comparison : -comparison;
    });

  // Helper functions
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getSelectionStatusBadge = (status?: string) => {
    switch (status) {
      case "selected":
        return (
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
            <CheckCircle className="h-3 w-3 mr-1" />
            Selected
          </Badge>
        );
      case "rejected":
        return (
          <Badge className="bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">
            <X className="h-3 w-3 mr-1" />
            Rejected
          </Badge>
        );
      default:
        return (
          <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">
            <Calendar className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return "text-green-600";
    if (score >= 6) return "text-yellow-600";
    if (score >= 4) return "text-orange-600";
    return "text-red-600";
  };

  // Simulated action handlers (console.log only)
  const handleSelectContestant = (contestant: Contestant) => {
    setSelectingContestant(contestant);
    setIsSelectDialogOpen(true);
  };

  const handleRejectContestant = (contestant: Contestant) => {
    setRejectingContestant(contestant);
    setIsRejectDialogOpen(true);
  };

  const confirmSelection = async () => {
    if (!selectingContestant) return;
    
    setSelectLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      console.log("SELECT CONTESTANT:", {
        contestantId: selectingContestant.id,
        contestantName: selectingContestant.name,
        score: selectingContestant.finalScore,
        timestamp: new Date().toISOString(),
      });
      
      // Update local state
      setContestants(prev => 
        prev.map(c => 
          c.id === selectingContestant.id 
            ? { ...c, selectionStatus: "selected", selectedAt: new Date().toISOString() }
            : c
        )
      );
      
      toast.success("Contestant selected successfully!");
      setIsSelectDialogOpen(false);
      setSelectingContestant(null);
      setSelectLoading(false);
    }, 1000);
  };

  const confirmRejection = async () => {
    if (!rejectingContestant) return;
    
    setRejectLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      console.log("REJECT CONTESTANT:", {
        contestantId: rejectingContestant.id,
        contestantName: rejectingContestant.name,
        score: rejectingContestant.finalScore,
        reason: rejectionReason,
        timestamp: new Date().toISOString(),
      });
      
      // Update local state
      setContestants(prev => 
        prev.map(c => 
          c.id === rejectingContestant.id 
            ? { 
                ...c, 
                selectionStatus: "rejected", 
                rejectedAt: new Date().toISOString(),
                rejectionReason: rejectionReason 
              }
            : c
        )
      );
      
      toast.success("Contestant rejected successfully!");
      setIsRejectDialogOpen(false);
      setRejectingContestant(null);
      setRejectionReason("");
      setRejectLoading(false);
    }, 1000);
  };

  const handleBulkAction = async () => {
    if (selectedContestantIds.length === 0) {
      toast.error("Please select contestants first");
      return;
    }

    setBulkLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      const selectedContestantsData = contestants.filter(c => 
        selectedContestantIds.includes(c.id)
      );
      
      console.log(`BULK ${bulkAction.toUpperCase()}:`, {
        action: bulkAction,
        contestantIds: selectedContestantIds,
        contestants: selectedContestantsData.map(c => ({
          id: c.id,
          name: c.name,
          score: c.finalScore,
        })),
        reason: bulkAction === "reject" ? rejectionReason : undefined,
        timestamp: new Date().toISOString(),
      });
      
      // Update local state
      setContestants(prev => 
        prev.map(c => {
          if (selectedContestantIds.includes(c.id)) {
            if (bulkAction === "select") {
              return { ...c, selectionStatus: "selected", selectedAt: new Date().toISOString() };
            } else {
              return { 
                ...c, 
                selectionStatus: "rejected", 
                rejectedAt: new Date().toISOString(),
                rejectionReason: rejectionReason 
              };
            }
          }
          return c;
        })
      );
      
      toast.success(`${selectedContestantIds.length} contestants ${bulkAction}ed successfully!`);
      setIsBulkDialogOpen(false);
      setSelectedContestantIds([]);
      setRejectionReason("");
      setBulkLoading(false);
    }, 1500);
  };

  const handleAutoSelect = () => {
    const eligibleContestants = contestants.filter(
      c => c.finalScore >= minScoreThreshold[0] && 
           (!c.selectionStatus || c.selectionStatus === "pending")
    );
    setSelectedContestantIds(eligibleContestants.map(c => c.id));
    setBulkAction("select");
    setIsBulkDialogOpen(true);
  };

  const handleAutoReject = () => {
    const eligibleContestants = contestants.filter(
      c => c.finalScore < minScoreThreshold[0] && 
           (!c.selectionStatus || c.selectionStatus === "pending")
    );
    setSelectedContestantIds(eligibleContestants.map(c => c.id));
    setBulkAction("reject");
    setIsBulkDialogOpen(true);
  };

  const toggleContestantSelection = (contestantId: string) => {
    setSelectedContestantIds(prev =>
      prev.includes(contestantId)
        ? prev.filter(id => id !== contestantId)
        : [...prev, contestantId]
    );
  };

  const selectAllVisible = () => {
    const pendingContestants = filteredContestants.filter(
      c => !c.selectionStatus || c.selectionStatus === "pending"
    );
    setSelectedContestantIds(pendingContestants.map(c => c.id));
  };

  const handleFinalizeSelection = () => {
    const finalSelectionData = {
      totalContestants: stats.total,
      selectedContestants: contestants.filter(c => c.selectionStatus === "selected"),
      rejectedContestants: contestants.filter(c => c.selectionStatus === "rejected"),
      pendingContestants: contestants.filter(c => !c.selectionStatus || c.selectionStatus === "pending"),
      statistics: stats,
      timestamp: new Date().toISOString(),
    };
    
    console.log("FINALIZE SELECTION:", finalSelectionData);
    
    toast.success("Selection finalized! Check console for complete data.");
    setIsFinalizeDialogOpen(false);
  };

  const handleExportReport = () => {
    const reportData = {
      contestants: contestants.map(c => ({
        id: c.id,
        name: c.name,
        email: c.email,
        finalScore: c.finalScore,
        selectionStatus: c.selectionStatus,
        selectedAt: c.selectedAt,
        rejectedAt: c.rejectedAt,
        rejectionReason: c.rejectionReason,
      })),
      statistics: stats,
      filters: {
        statusFilter: filterStatus,
        minScore: minScoreThreshold[0],
        maxScore: maxScoreThreshold[0],
        searchTerm,
      },
      exportedAt: new Date().toISOString(),
    };
    
    console.log("EXPORT REPORT:", reportData);
    toast.success("Report exported! Check console for data.");
  };

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
                  Loading Selection Data
                </h3>
                <p className="text-muted-foreground">
                  Fetching evaluated contestants for selection...
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (contestantsError) {
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
                    Failed to Load Selection Data
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {contestantsError.message ||
                      "An unexpected error occurred while loading contestant data."}
                  </p>
                </div>

                <Button onClick={() => refetch()} className="px-6">
                  Try Again
                </Button>
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
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push("/inductions/contestants")}
            className="p-2 hover:bg-muted"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-4xl font-bold text-foreground">
              Finalize Induction Selection
            </h1>
            <p className="text-muted-foreground text-lg">
              Review evaluated candidates and make final selection decisions
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="gap-2" onClick={handleExportReport}>
              <Download className="h-4 w-4" />
              Export Report
            </Button>
            <Button
              onClick={() => setIsFinalizeDialogOpen(true)}
              disabled={stats.pending === 0}
              className="gap-2"
            >
              <FileText className="h-4 w-4" />
              Finalize Selection
            </Button>
          </div>
        </div>

        {/* Statistics Dashboard */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-blue-600">{stats.total}</div>
              <p className="text-sm text-muted-foreground">Total Evaluated</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-green-600">{stats.selected}</div>
              <p className="text-sm text-muted-foreground">Selected</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-red-600">{stats.rejected}</div>
              <p className="text-sm text-muted-foreground">Rejected</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-yellow-600">{stats.pending}</div>
              <p className="text-sm text-muted-foreground">Pending</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-primary">{stats.averageScore.toFixed(1)}</div>
              <p className="text-sm text-muted-foreground">Avg Score</p>
            </CardContent>
          </Card>
        </div>

        {/* Smart Selection Tools */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Smart Selection Tools
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">
                    Score Threshold: {minScoreThreshold[0]}/10
                  </Label>
                  <Slider
                    value={minScoreThreshold}
                    onValueChange={setMinScoreThreshold}
                    max={10}
                    min={1}
                    step={0.5}
                    className="mt-2"
                  />
                </div>
                
                <div className="flex gap-2">
                  <Button
                    onClick={handleAutoSelect}
                    variant="outline"
                    className="flex-1 text-green-700 border-green-200 hover:bg-green-50"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Auto-Select Above {minScoreThreshold[0]}
                  </Button>
                  <Button
                    onClick={handleAutoReject}
                    variant="outline"
                    className="flex-1 text-red-700 border-red-200 hover:bg-red-50"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Auto-Reject Below {minScoreThreshold[0]}
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-medium mb-2">Selection Preview</h4>
                  <p className="text-sm text-muted-foreground">
                    <strong>{contestants.filter(c => c.finalScore >= minScoreThreshold[0]).length}</strong> contestants 
                    would be selected with score ≥ {minScoreThreshold[0]}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    <strong>{contestants.filter(c => c.finalScore < minScoreThreshold[0]).length}</strong> contestants 
                    would be rejected with score &lt; {minScoreThreshold[0]}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex gap-2">
            <Button
              variant={filterStatus === "all" ? "default" : "outline"}
              onClick={() => setFilterStatus("all")}
              size="sm"
            >
              All ({stats.total})
            </Button>
            <Button
              variant={filterStatus === "pending" ? "default" : "outline"}
              onClick={() => setFilterStatus("pending")}
              size="sm"
            >
              Pending ({stats.pending})
            </Button>
            <Button
              variant={filterStatus === "selected" ? "default" : "outline"}
              onClick={() => setFilterStatus("selected")}
              size="sm"
            >
              Selected ({stats.selected})
            </Button>
            <Button
              variant={filterStatus === "rejected" ? "default" : "outline"}
              onClick={() => setFilterStatus("rejected")}
              size="sm"
            >
              Rejected ({stats.rejected})
            </Button>
          </div>

          <div className="flex gap-2 flex-1">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search contestants..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="score">Score</SelectItem>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="date">Date</SelectItem>
              </SelectContent>
            </Select>
            
            <Button
              variant="outline"
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              size="sm"
            >
              {sortOrder === "asc" ? "↑" : "↓"}
            </Button>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedContestantIds.length > 0 && (
          <Card className="mb-6 border-2 border-blue-200 bg-blue-50 dark:bg-blue-950/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-blue-600" />
                  <span className="font-medium">
                    {selectedContestantIds.length} contestant{selectedContestantIds.length !== 1 ? 's' : ''} selected
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => {
                      setBulkAction("select");
                      setIsBulkDialogOpen(true);
                    }}
                    size="sm"
                    className="bg-green-600 hover:bg-green-700"
                    disabled={bulkLoading}
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Select All
                  </Button>
                  <Button
                    onClick={() => {
                      setBulkAction("reject");
                      setIsBulkDialogOpen(true);
                    }}
                    size="sm"
                    variant="destructive"
                    disabled={bulkLoading}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Reject All
                  </Button>
                  <Button
                    onClick={() => setSelectedContestantIds([])}
                    size="sm"
                    variant="outline"
                  >
                    Clear
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Contestants Table */}
        <Card className="shadow-lg border-2">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle>Evaluated Contestants</CardTitle>
              <div className="flex gap-2">
                <Button
                  onClick={selectAllVisible}
                  variant="outline"
                  size="sm"
                  disabled={filteredContestants.filter(c => !c.selectionStatus || c.selectionStatus === "pending").length === 0}
                >
                  Select All Visible
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-b-2 bg-muted/50">
                  <TableHead className="w-12 py-4 px-6">
                    <Checkbox
                      checked={selectedContestantIds.length === filteredContestants.filter(c => !c.selectionStatus || c.selectionStatus === "pending").length && filteredContestants.length > 0}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          selectAllVisible();
                        } else {
                          setSelectedContestantIds([]);
                        }
                      }}
                    />
                  </TableHead>
                  <TableHead className="py-4 px-6 font-semibold text-foreground">
                    Contestant
                  </TableHead>
                  <TableHead className="py-4 px-6 font-semibold text-foreground">
                    Score
                  </TableHead>
                  <TableHead className="py-4 px-6 font-semibold text-foreground">
                    Status
                  </TableHead>
                  <TableHead className="py-4 px-6 font-semibold text-foreground">
                    Evaluated
                  </TableHead>
                  <TableHead className="w-48 py-4 px-6 text-right font-semibold text-foreground">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredContestants.map((contestant) => (
                  <TableRow
                    key={contestant.id}
                    className="hover:bg-muted/30 transition-colors duration-150 border-b last:border-b-0"
                  >
                    <TableCell className="py-4 px-6">
                      <Checkbox
                        checked={selectedContestantIds.includes(contestant.id)}
                        onCheckedChange={() => toggleContestantSelection(contestant.id)}
                        disabled={contestant.selectionStatus && contestant.selectionStatus !== "pending"}
                      />
                    </TableCell>
                    <TableCell className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 border-2 border-primary/20">
                          <AvatarFallback className="bg-primary text-primary-foreground text-sm font-medium">
                            {getInitials(contestant.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium text-foreground text-base">
                            {contestant.name}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {contestant.email}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <span className={`text-xl font-bold ${getScoreColor(contestant.finalScore)}`}>
                          {contestant.finalScore}
                        </span>
                        <span className="text-muted-foreground">/10</span>
                      </div>
                    </TableCell>
                    <TableCell className="py-4 px-6">
                      {getSelectionStatusBadge(contestant.selectionStatus)}
                    </TableCell>
                    <TableCell className="py-4 px-6">
                      <div className="text-sm text-muted-foreground">
                        {new Date(contestant.evaluatedAt).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell className="py-4 px-6">
                      <div className="flex gap-2 justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => router.push(`/inductions/contestants/${contestant.id}/evaluate`)}
                          className="h-9 w-9 p-0 hover:bg-blue-100 hover:text-blue-600 transition-colors"
                          title="View Evaluation"
                        >
                          <Eye size={16} />
                        </Button>
                        
                        {(!contestant.selectionStatus || contestant.selectionStatus === "pending") && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleSelectContestant(contestant)}
                              className="h-9 w-9 p-0 hover:bg-green-100 hover:text-green-600 transition-colors"
                              disabled={selectLoading || rejectLoading || bulkLoading}
                              title="Select Contestant"
                            >
                              {selectLoading && selectingContestant?.id === contestant.id ? (
                                <Loader2 size={16} className="animate-spin" />
                              ) : (
                                <UserCheck size={16} />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRejectContestant(contestant)}
                              className="h-9 w-9 p-0 hover:bg-red-100 hover:text-red-600 transition-colors"
                              disabled={selectLoading || rejectLoading || bulkLoading}
                              title="Reject Contestant"
                            >
                              {rejectLoading && rejectingContestant?.id === contestant.id ? (
                                <Loader2 size={16} className="animate-spin" />
                              ) : (
                                <UserX size={16} />
                              )}
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {filteredContestants.length === 0 && (
              <div className="text-center py-20">
                <Users className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  No Contestants Found
                </h3>
                <p className="text-muted-foreground">
                  {contestants.length === 0 
                    ? "No evaluated contestants available for selection." 
                    : "Try adjusting your filters to see more results."
                  }
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* All the existing dialogs remain the same, just update the handlers */}
        
        {/* Selection Confirmation Dialog */}
        <Dialog open={isSelectDialogOpen} onOpenChange={setIsSelectDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <div className="flex flex-col items-center space-y-6 p-6">
              <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
              </div>
              
              <div className="text-center space-y-3">
                <h3 className="text-xl font-semibold text-foreground">
                  Select for Induction
                </h3>
                <p className="text-muted-foreground">
                  Are you sure you want to select{" "}
                  <span className="font-semibold text-foreground">
                    "{selectingContestant?.name}"
                  </span>{" "}
                  for the induction process?
                </p>
                <div className="p-3 bg-green-50 dark:bg-green-950/30 rounded-lg">
                  <p className="text-sm text-green-800 dark:text-green-200">
                    Score: <span className="font-bold">{selectingContestant?.finalScore}/10</span>
                  </p>
                </div>
              </div>

              <div className="flex gap-4 w-full pt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsSelectDialogOpen(false)}
                  className="flex-1 border-2"
                  disabled={selectLoading}
                >
                  Cancel
                </Button>
                <Button
                  onClick={confirmSelection}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  disabled={selectLoading}
                >
                  {selectLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Selecting...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Confirm Selection
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Rejection Confirmation Dialog */}
        <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <div className="flex flex-col items-center space-y-6 p-6">
              <div className="w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                <X className="h-10 w-10 text-red-600 dark:text-red-400" />
              </div>
              
              <div className="text-center space-y-3">
                <h3 className="text-xl font-semibold text-foreground">
                  Reject Contestant
                </h3>
                <p className="text-muted-foreground">
                  Are you sure you want to reject{" "}
                  <span className="font-semibold text-foreground">
                    "{rejectingContestant?.name}"
                  </span>
                  ?
                </p>
                <div className="p-3 bg-red-50 dark:bg-red-950/30 rounded-lg">
                  <p className="text-sm text-red-800 dark:text-red-200">
                    Score: <span className="font-bold">{rejectingContestant?.finalScore}/10</span>
                  </p>
                </div>
              </div>

              <div className="w-full space-y-3">
                <Label htmlFor="rejection-reason">Rejection Reason (Optional)</Label>
                <Textarea
                  id="rejection-reason"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Enter reason for rejection..."
                  className="min-h-20"
                  disabled={rejectLoading}
                />
              </div>

              <div className="flex gap-4 w-full pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsRejectDialogOpen(false);
                    setRejectionReason("");
                  }}
                  className="flex-1 border-2"
                  disabled={rejectLoading}
                >
                  Cancel
                </Button>
                <Button
                  onClick={confirmRejection}
                  variant="destructive"
                  className="flex-1"
                  disabled={rejectLoading}
                >
                  {rejectLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Rejecting...
                    </>
                  ) : (
                    <>
                      <X className="h-4 w-4 mr-2" />
                      Confirm Rejection
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Bulk Action Dialog */}
        <Dialog open={isBulkDialogOpen} onOpenChange={setIsBulkDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <div className="flex flex-col items-center space-y-6 p-6">
              <div className={`w-20 h-20 rounded-full flex items-center justify-center ${
                bulkAction === "select" 
                  ? "bg-green-100 dark:bg-green-900/20" 
                  : "bg-red-100 dark:bg-red-900/20"
              }`}>
                {bulkAction === "select" ? (
                  <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
                ) : (
                  <X className="h-10 w-10 text-red-600 dark:text-red-400" />
                )}
              </div>
              
              <div className="text-center space-y-3">
                <h3 className="text-xl font-semibold text-foreground">
                  Bulk {bulkAction === "select" ? "Selection" : "Rejection"}
                </h3>
                <p className="text-muted-foreground">
                  Are you sure you want to {bulkAction}{" "}
                  <span className="font-semibold text-foreground">
                    {selectedContestantIds.length}
                  </span>{" "}
                  contestant{selectedContestantIds.length !== 1 ? 's' : ''}?
                </p>
              </div>

              {bulkAction === "reject" && (
                <div className="w-full space-y-3">
                  <Label htmlFor="bulk-rejection-reason">Rejection Reason (Optional)</Label>
                  <Textarea
                    id="bulk-rejection-reason"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Enter reason for rejection..."
                    className="min-h-20"
                    disabled={bulkLoading}
                  />
                </div>
              )}

              <div className="flex gap-4 w-full pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsBulkDialogOpen(false);
                    setRejectionReason("");
                  }}
                  className="flex-1 border-2"
                  disabled={bulkLoading}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleBulkAction}
                  className={`flex-1 ${
                    bulkAction === "select" 
                      ? "bg-green-600 hover:bg-green-700" 
                      : "bg-red-600 hover:bg-red-700"
                  }`}
                  disabled={bulkLoading}
                >
                  {bulkLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Processing...
                    </>
                  ) : (
                    <>
                      {bulkAction === "select" ? (
                        <CheckCircle className="h-4 w-4 mr-2" />
                      ) : (
                        <X className="h-4 w-4 mr-2" />
                      )}
                      Confirm {bulkAction === "select" ? "Selection" : "Rejection"}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Finalize Selection Dialog */}
        <Dialog open={isFinalizeDialogOpen} onOpenChange={setIsFinalizeDialogOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-2xl">Finalize Induction Selection</DialogTitle>
              <DialogDescription>
                Complete the selection process and notify all contestants of their status.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6 py-6">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Warning:</strong> Once finalized, selection decisions cannot be easily changed. 
                  All contestants will be notified of their status.
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-4 bg-green-50 dark:bg-green-950/30 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{stats.selected}</div>
                  <p className="text-sm text-green-800 dark:text-green-200">Selected</p>
                </div>
                <div className="p-4 bg-red-50 dark:bg-red-950/30 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
                  <p className="text-sm text-red-800 dark:text-red-200">Rejected</p>
                </div>
                <div className="p-4 bg-yellow-50 dark:bg-yellow-950/30 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">Pending</p>
                </div>
              </div>

              {stats.pending > 0 && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    You still have {stats.pending} pending contestant{stats.pending !== 1 ? 's' : ''}. 
                    Please make decisions for all contestants before finalizing.
                  </AlertDescription>
                </Alert>
              )}
            </div>

            <DialogFooter className="gap-3">
              <Button
                variant="outline"
                onClick={() => setIsFinalizeDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                disabled={stats.pending > 0}
                className="bg-primary hover:bg-primary/90"
                onClick={handleFinalizeSelection}
              >
                <Mail className="h-4 w-4 mr-2" />
                Finalize & Notify All
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
