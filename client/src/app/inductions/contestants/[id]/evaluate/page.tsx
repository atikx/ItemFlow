"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import {
  ArrowLeft,
  Mail,
  Star,
  CheckCircle,
  Loader2,
  AlertCircle,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { useMutation, useQuery } from "@apollo/client";
import { GET_INDUCTION_QUANTITIES } from "@/graphql/inductionQuantities.graphql";
import {
  EVALUATE_INDUCTION_CONTESTANT,
  GET_INDUCTION_CONTESTANT_EVALUATIONS,
} from "@/graphql/inductionContestants.graphql";

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

interface QualitiesQueryData {
  inductionQuantities: InductionQuantity[];
}

interface EvaluationItem {
  __typename: string;
  id: string;
  score: number;
  quality: {
    __typename: string;
    id: string;
    name: string;
    weightage: number;
  };
}

interface Contestant {
  id: string;
  name: string;
  email: string;
  finalScore?: number | null;
  evaluations?: EvaluationItem[];
}

interface EvaluationQueryData {
  getContestantEvaluationData: {
    __typename: string;
    id: string;
    name: string;
    email: string;
    finalScore?: number | null;
    evaluations: EvaluationItem[];
  };
}

interface QualityEvaluation {
  qualityId: string;
  score: number;
}

interface Evaluation {
  contestantId: string;
  qualities: QualityEvaluation[];
  totalScore: number;
  isCompleted: boolean;
}

interface EvaluationMutationData {
  evaluateInductionContestant: {
    id: string;
    finalScore: number;
    message: string;
  };
}

export default function EvaluationPage() {
  const router = useRouter();
  const params = useParams();
  const contestantId = params.id as string;

  const [contestant, setContestant] = useState<Contestant | null>(null);
  const [qualities, setQualities] = useState<Quality[]>([]);
  const [evaluation, setEvaluation] = useState<Evaluation>({
    contestantId,
    qualities: [],
    totalScore: 0,
    isCompleted: false,
  });

  // GraphQL Query for contestant evaluation data
  const {
    data: evaluationData,
    error: evaluationError,
    loading: evaluationLoading,
    refetch: refetchEvaluation,
  } = useQuery<EvaluationQueryData>(GET_INDUCTION_CONTESTANT_EVALUATIONS, {
    variables: { getContestantEvaluationDataId: contestantId },
    errorPolicy: "all",
    notifyOnNetworkStatusChange: true,
    fetchPolicy: "cache-and-network",
  });

  // GraphQL Query for qualities
  const {
    data: qualitiesData,
    loading: qualitiesLoading,
    error: qualitiesError,
    refetch: refetchQualities,
  } = useQuery<QualitiesQueryData>(GET_INDUCTION_QUANTITIES, {
    errorPolicy: "all",
    notifyOnNetworkStatusChange: true,
    fetchPolicy: "cache-and-network",
  });

  // GraphQL Mutation for evaluation
  const [evaluateContestant, { 
    loading: evaluationMutationLoading, 
    error: evaluationMutationError 
  }] = useMutation<EvaluationMutationData>(EVALUATE_INDUCTION_CONTESTANT, {
    onCompleted: (data) => {
      setEvaluation(prev => ({ ...prev, isCompleted: true }));
      toast.success("Evaluation completed successfully!");
      // Optionally refresh the evaluation data to get updated state
      refetchEvaluation();
    },
    onError: (error) => {
      console.error("Error completing evaluation:", error);
      toast.error(`Failed to complete evaluation: ${error.message}`);
    },
    refetchQueries: [
      { 
        query: GET_INDUCTION_CONTESTANT_EVALUATIONS, 
        variables: { getContestantEvaluationDataId: contestantId } 
      }
    ],
  });

  // Initialize contestant data from GraphQL
  useEffect(() => {
    if (evaluationData?.getContestantEvaluationData) {
      const contestantData = evaluationData.getContestantEvaluationData;
      setContestant({
        id: contestantData.id,
        name: contestantData.name,
        email: contestantData.email,
        finalScore: contestantData.finalScore,
        evaluations: contestantData.evaluations,
      });
    }
  }, [evaluationData]);

  // Initialize qualities and evaluation scores
  useEffect(() => {
    if (qualitiesData?.inductionQuantities && contestant) {
      const formattedQualities: Quality[] =
        qualitiesData.inductionQuantities.map((item) => ({
          id: item.id,
          name: item.name,
          weightage: item.weightage,
        }));
      setQualities(formattedQualities);

      // Initialize evaluation scores
      if (contestant.evaluations && contestant.evaluations.length > 0) {
        // Load existing evaluation data from the nested structure
        const existingEvaluations = contestant.evaluations.map(
          (evaluationItem) => ({
            qualityId: evaluationItem.quality.id,
            score: evaluationItem.score,
          })
        );

        setEvaluation((prev) => ({
          ...prev,
          qualities: existingEvaluations,
          isCompleted: contestant.finalScore !== null,
        }));
      } else {
        // Initialize with default scores for all qualities
        setEvaluation((prev) => ({
          ...prev,
          qualities: formattedQualities.map((q) => ({
            qualityId: q.id,
            score: 5, // Default score
          })),
          isCompleted: false,
        }));
      }
    }
  }, [qualitiesData, contestant]);

  // Calculate total weighted score
  useEffect(() => {
    if (qualities.length > 0 && evaluation.qualities.length > 0) {
      const totalWeightedScore = evaluation.qualities.reduce(
        (total, qualityEval) => {
          const quality = qualities.find((q) => q.id === qualityEval.qualityId);
          if (quality) {
            return total + (qualityEval.score * quality.weightage) / 100;
          }
          return total;
        },
        0
      );

      setEvaluation((prev) => ({
        ...prev,
        totalScore: Math.round(totalWeightedScore * 10) / 10,
      }));
    }
  }, [evaluation.qualities, qualities]);

  // Show error toasts for mutation errors
  useEffect(() => {
    if (evaluationMutationError) {
      toast.error(`Evaluation error: ${evaluationMutationError.message}`);
    }
  }, [evaluationMutationError]);

  // Calculate total weightage to validate
  const totalWeightage = qualities.reduce(
    (sum, quality) => sum + quality.weightage,
    0
  );
  const isWeightageValid = totalWeightage === 100;

  const updateQualityScore = (qualityId: string, score: number) => {
    // Only allow updates if contestant is not already evaluated
    if (contestant?.finalScore === null) {
      setEvaluation((prev) => ({
        ...prev,
        qualities: prev.qualities.map((q) =>
          q.qualityId === qualityId ? { ...q, score } : q
        ),
      }));
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return "text-green-600";
    if (score >= 6) return "text-yellow-600";
    if (score >= 4) return "text-orange-600";
    return "text-red-600";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 9) return "Excellent";
    if (score >= 8) return "Very Good";
    if (score >= 7) return "Good";
    if (score >= 6) return "Above Average";
    if (score >= 5) return "Average";
    if (score >= 4) return "Below Average";
    if (score >= 3) return "Poor";
    return "Very Poor";
  };

  const completeEvaluation = async () => {
    if (!isWeightageValid) {
      toast.error(
        `Cannot complete evaluation. Total weightage is ${totalWeightage}% but should be 100%`
      );
      return;
    }

    if (!contestant) {
      toast.error("Contestant data not found");
      return;
    }

    try {
      await evaluateContestant({
        variables: {
          evaluateContestantInput: {
            contestantId: evaluation.contestantId,
            totalScore: evaluation.totalScore,
            qualities: evaluation.qualities,
          },
        },
      });
    } catch (error) {
      // Error is handled by onError callback
      console.error("Mutation error:", error);
    }
  };

  const handleRetryQuery = async () => {
    try {
      await Promise.all([refetchQualities(), refetchEvaluation()]);
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

  // Combined loading state
  const isLoading = qualitiesLoading || evaluationLoading || evaluationMutationLoading;

  // Check if contestant is already evaluated
  const isAlreadyEvaluated = contestant?.finalScore !== null;

  // Loading state
  if ((qualitiesLoading || evaluationLoading) && !contestant && qualities.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto p-8 max-w-4xl">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center space-y-4">
              <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-foreground">
                  Loading Evaluation
                </h3>
                <p className="text-muted-foreground">
                  {qualitiesLoading && evaluationLoading
                    ? "Loading contestant and evaluation data..."
                    : qualitiesLoading
                    ? "Loading evaluation qualities..."
                    : evaluationLoading
                    ? "Loading contestant information..."
                    : "Loading..."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (qualitiesError || evaluationError) {
    const error = qualitiesError || evaluationError;
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto p-8 max-w-4xl">
          <div className="flex items-center justify-center min-h-[60vh]">
            <Card className="w-full max-w-md shadow-lg border-2">
              <CardContent className="p-8 text-center space-y-6">
                <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                  <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-foreground">
                    Failed to Load Evaluation Data
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {error?.message ||
                      "An unexpected error occurred while loading the evaluation data."}
                  </p>
                </div>

                <div className="flex gap-3 justify-center">
                  <Button
                    variant="outline"
                    onClick={() => router.push("/inductions/contestants")}
                    className="px-6"
                  >
                    Go Back
                  </Button>
                  <Button
                    onClick={handleRetryQuery}
                    className="px-6"
                    disabled={qualitiesLoading || evaluationLoading}
                  >
                    {qualitiesLoading || evaluationLoading ? (
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

  // Check if contestant was found
  if (!contestant) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto p-8 max-w-4xl">
          <div className="flex items-center justify-center min-h-[60vh]">
            <Card className="w-full max-w-md shadow-lg border-2">
              <CardContent className="p-8 text-center space-y-6">
                <div className="mx-auto w-16 h-16 bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center">
                  <AlertTriangle className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-foreground">
                    Contestant Not Found
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    The requested contestant could not be found in the system.
                  </p>
                </div>

                <Button
                  onClick={() => router.push("/inductions/contestants")}
                  className="px-6"
                >
                  Back to Contestants
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Check if qualities are loaded and valid
  if (qualities.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto p-8 max-w-4xl">
          <div className="flex items-center justify-center min-h-[60vh]">
            <Card className="w-full max-w-md shadow-lg border-2">
              <CardContent className="p-8 text-center space-y-6">
                <div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                  <AlertCircle className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-foreground">
                    No Evaluation Qualities Found
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    No evaluation qualities have been configured yet. Please add
                    some qualities first before evaluating contestants.
                  </p>
                </div>

                <div className="flex gap-3 justify-center">
                  <Button
                    variant="outline"
                    onClick={() => router.push("/inductions/contestants")}
                    className="px-6"
                  >
                    Go Back
                  </Button>
                  <Button
                    onClick={() => router.push("/inductions/qualities")}
                    className="px-6"
                  >
                    Add Qualities
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
      <div className="container mx-auto p-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push("/inductions/contestants")}
            className="p-2 hover:bg-muted"
            disabled={isLoading}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-foreground">
              {isAlreadyEvaluated ? "View Evaluation" : "Evaluate Contestant"}
            </h1>
            <p className="text-muted-foreground">
              {isAlreadyEvaluated
                ? "Review the completed evaluation scores"
                : "Rate the contestant on different qualities"}
            </p>
          </div>
          {isAlreadyEvaluated && (
            <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
              Already Evaluated
            </Badge>
          )}
          {evaluationMutationLoading && (
            <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
              <Loader2 className="h-3 w-3 animate-spin mr-1" />
              Saving...
            </Badge>
          )}
        </div>

        {/* Mutation Error Alert */}
        {evaluationMutationError && (
          <Alert className="mb-6 border-2" variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Evaluation Error:</strong> {evaluationMutationError.message}
            </AlertDescription>
          </Alert>
        )}

        {/* Weightage Validation Alert */}
        {!isWeightageValid && !isAlreadyEvaluated && (
          <Alert className="mb-6 border-2" variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <div>
                <strong>Invalid Quality Configuration:</strong> Total weightage
                is <span className="font-bold">{totalWeightage}%</span> but
                should be exactly <span className="font-bold">100%</span>.
                Evaluation cannot be completed until this is fixed.
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push("/inductions/qualities")}
                className="ml-4 border-white text-white hover:bg-white hover:text-destructive"
              >
                Fix Qualities
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Contestant Info Card */}
        <Card className="mb-8 shadow-lg border-2">
          <CardHeader>
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 border-2 border-primary/20">
                <AvatarFallback className="bg-primary text-primary-foreground text-lg font-semibold">
                  {getInitials(contestant.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h2 className="text-2xl font-semibold text-foreground">
                  {contestant.name}
                </h2>
                <div className="flex items-center gap-2 text-muted-foreground mt-1">
                  <Mail className="h-4 w-4" />
                  <span>{contestant.email}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-primary">
                  {isAlreadyEvaluated
                    ? contestant.finalScore
                    : evaluation.totalScore}
                  <span className="text-lg text-muted-foreground">/10</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {isAlreadyEvaluated ? "Final Score" : "Current Score"}
                </p>
                {!isWeightageValid && !isAlreadyEvaluated && (
                  <Badge variant="destructive" className="mt-1 text-xs">
                    Invalid Config
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Quality Evaluations */}
        <div className="space-y-6 mb-8">
          {qualities.map((quality, index) => {
            const qualityEval = evaluation.qualities.find(
              (q) => q.qualityId === quality.id
            );
            if (!qualityEval) return null;

            return (
              <Card
                key={quality.id}
                className={`shadow-lg border-2 ${
                  !isWeightageValid && !isAlreadyEvaluated ? "opacity-90" : ""
                } ${isAlreadyEvaluated ? "bg-muted/30" : ""} ${
                  evaluationMutationLoading ? "opacity-75" : ""
                }`}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center text-primary-foreground font-semibold text-sm ${
                          isAlreadyEvaluated ? "bg-green-600" : "bg-primary"
                        }`}
                      >
                        {index + 1}
                      </div>
                      <div>
                        <CardTitle className="text-xl">
                          {quality.name}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                          Weightage: {quality.weightage}%
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div
                        className={`text-2xl font-bold ${getScoreColor(
                          qualityEval.score
                        )}`}
                      >
                        {qualityEval.score}
                        <span className="text-lg text-muted-foreground">
                          /10
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {getScoreLabel(qualityEval.score)}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Score Slider */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">
                      Score: {qualityEval.score}/10
                      {isAlreadyEvaluated && (
                        <span className="ml-2 text-xs text-muted-foreground">
                          (Read-only)
                        </span>
                      )}
                      {evaluationMutationLoading && (
                        <span className="ml-2 text-xs text-blue-600">
                          (Saving...)
                        </span>
                      )}
                    </Label>
                    <Slider
                      value={[qualityEval.score]}
                      onValueChange={(value) =>
                        updateQualityScore(quality.id, value[0])
                      }
                      max={10}
                      min={1}
                      step={0.5}
                      className={`w-full ${
                        isAlreadyEvaluated || evaluationMutationLoading ? "opacity-60" : ""
                      }`}
                      disabled={isLoading || isAlreadyEvaluated}
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Poor (1)</span>
                      <span>Average (5)</span>
                      <span>Excellent (10)</span>
                    </div>
                  </div>

                  {/* Weighted Score Display */}
                  <div
                    className={`bg-muted/50 p-4 rounded-lg ${
                      isAlreadyEvaluated
                        ? "border-2 border-green-200 bg-green-50 dark:bg-green-950/30"
                        : ""
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">
                        Weighted Score:
                      </span>
                      <span
                        className={`font-bold ${
                          isAlreadyEvaluated ? "text-green-600" : "text-primary"
                        }`}
                      >
                        {(
                          (qualityEval.score * quality.weightage) /
                          100
                        ).toFixed(2)}{" "}
                        points
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      ({qualityEval.score} × {quality.weightage}% ={" "}
                      {((qualityEval.score * quality.weightage) / 100).toFixed(
                        2
                      )}
                      )
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Final Score Summary */}
        <Card className="mb-8 shadow-lg border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-primary" />
              Final Assessment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`p-6 rounded-lg border ${
                isAlreadyEvaluated
                  ? "bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-800"
                  : !isWeightageValid
                  ? "bg-primary/5 border-primary/20 opacity-50"
                  : "bg-primary/5 border-primary/20"
              } ${evaluationMutationLoading ? "opacity-75" : ""}`}
            >
              <div className="flex items-center gap-3 mb-3">
                <div
                  className={`p-2 rounded-lg ${
                    isAlreadyEvaluated ? "bg-green-100" : "bg-primary/10"
                  }`}
                >
                  {evaluationMutationLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  ) : (
                    <Star
                      className={`h-5 w-5 ${
                        isAlreadyEvaluated ? "text-green-600" : "text-primary"
                      }`}
                    />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">
                    {isAlreadyEvaluated
                      ? "Final Score (Completed)"
                      : evaluationMutationLoading
                      ? "Final Score (Saving...)"
                      : "Final Score"}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Weighted average based on quality scores
                    {!isWeightageValid &&
                      !isAlreadyEvaluated &&
                      " (Invalid - Fix quality weightages)"}
                  </p>
                </div>
              </div>
              <div
                className={`text-4xl font-bold ${
                  isAlreadyEvaluated ? "text-green-600" : "text-primary"
                }`}
              >
                {isWeightageValid || isAlreadyEvaluated
                  ? isAlreadyEvaluated
                    ? contestant.finalScore
                    : evaluation.totalScore
                  : "N/A"}
                {(isWeightageValid || isAlreadyEvaluated) && (
                  <span className="text-xl text-muted-foreground">/10</span>
                )}
              </div>
              {isWeightageValid || isAlreadyEvaluated ? (
                <div className="mt-2">
                  <Badge
                    className={`${getScoreColor(
                      isAlreadyEvaluated
                        ? contestant.finalScore!
                        : evaluation.totalScore
                    )} bg-transparent border-current`}
                    variant="outline"
                  >
                    {getScoreLabel(
                      isAlreadyEvaluated
                        ? contestant.finalScore!
                        : evaluation.totalScore
                    )}
                  </Badge>
                </div>
              ) : (
                <div className="mt-2">
                  <Badge
                    variant="destructive"
                    className="bg-transparent border-current"
                  >
                    Configuration Invalid
                  </Badge>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-end">
          <Button
            variant="outline"
            onClick={() => router.push("/inductions/contestants")}
            className="px-6 py-2 border-2"
            disabled={evaluationMutationLoading}
          >
            {isAlreadyEvaluated ? "Back" : "Cancel"}
          </Button>
          {!isAlreadyEvaluated && (
            <Button
              onClick={completeEvaluation}
              className="px-6 py-2 bg-primary hover:bg-primary/90"
              disabled={evaluationMutationLoading || !isWeightageValid}
            >
              {evaluationMutationLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Completing...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Complete Evaluation
                </>
              )}
            </Button>
          )}
        </div>

        {/* Bottom Warning */}
        {!isWeightageValid && !isAlreadyEvaluated && (
          <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-center gap-2 text-red-800 dark:text-red-200">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm font-medium">
                Evaluation is blocked until quality weightages total exactly
                100%. Current total: {totalWeightage}%
              </span>
            </div>
          </div>
        )}

        {/* Already Evaluated Notice */}
        {isAlreadyEvaluated && (
          <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <div className="flex items-center gap-2 text-green-800 dark:text-green-200">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm font-medium">
                This contestant has been evaluated with a final score of{" "}
                {contestant.finalScore}/10. All evaluation data is preserved and
                displayed in read-only mode.
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
