/**
 * API service for handling PDF processing and criteria extraction
 */

export interface Criterion {
  category: string;
  quantity: number;
  specs: ProductSpecs;
}

export interface ExtractCriteriaResponse {
  criteria: Criterion[];
  success: boolean;
  message?: string;
}

export interface SubmitCriteriaResponse {
  success: boolean;
  message: string;
  nextSteps?: string[];
  recommendations?: ProductRecommendation[];
}

export interface ProductSpecs {
  [key: string]: string | number;
}

export interface ProductRecommendation {
  id: string | number;
  category: string;
  price: number;
  brand: string;
  model_name: string;
  specs: ProductSpecs;
}

export interface ProcessingResponse {
  success: boolean;
  message?: string;
  recommendations: ProductRecommendation[];
}

export interface RFQEmail {
  category: string;
  subject: string;
  to: string;
  content: string;
}

export interface GenerateEmailsResponse {
  success: boolean;
  message?: string;
  emails: RFQEmail[];
}

export interface SendEmailsResponse {
  success: boolean;
  message?: string;
}

export async function generateEmails(
  recommendations: ProductRecommendation[]
): Promise<GenerateEmailsResponse> {
  try {
    if (!Array.isArray(recommendations)) {
      throw new Error("Recommendations must be an array");
    }

    if (recommendations.length === 0) {
      return {
        success: true,
        emails: [],
      };
    }

    const emails: RFQEmail[] = [];

    for (const recommendation of recommendations) {
      const response = await fetch("http://localhost:3001/gen-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          item_id: recommendation.id,
        }),
      });

      if (!response.ok) {
        throw new Error(
          `Failed to generate email for ${recommendation.category}`
        );
      }

      const data = await response.json();

      emails.push({
        category: recommendation.category,
        subject: data.subject || "",
        to: data.email || "",
        content: data.content || "",
      });
    }

    return {
      success: true,
      emails,
    };
  } catch (error) {
    console.error("Error generating emails:", error);

    return {
      success: false,
      message:
        error instanceof Error ? error.message : "An unexpected error occurred",
      emails: [],
    };
  }
}

export async function sendEmails(
  emails: RFQEmail[]
): Promise<SendEmailsResponse> {
  // Mock API call - in a real app, you would send a request to your server
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        message: "All emails have been sent successfully",
      });
    }, 1500);
  });
}

// In a real implementation, replace these functions with actual API calls:
export async function extractCriteriaFromPDF(
  file: File
): Promise<ExtractCriteriaResponse> {
  try {
    const formData = new FormData();

    formData.append("file", file);
    const uploadedFile = formData.get("file") as File;
    const fileContent = await uploadedFile.text();

    // create json object with input key and text as value
    const json = {
      input: fileContent,
    };

    const response = await fetch("http://localhost:3001/extract-req", {
      method: "POST",
      body: JSON.stringify(json),
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to process MD/TXT file");
    }

    const data = await response.json();

    return {
      criteria: data,
      success: true,
      message: "Criteria extracted successfully",
    };
  } catch (error) {
    return {
      criteria: [],
      success: false,
      message:
        error instanceof Error ? error.message : "An unknown error occurred",
    };
  }
}

export async function submitCriteria(
  criteria: Criterion[]
): Promise<SubmitCriteriaResponse> {
  try {
    const response = await fetch("http://localhost:3001/match-product", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ requirements: criteria }),
    });

    if (!response.ok) {
      throw new Error("Failed to submit criteria");
    }

    const data = await response.json();

    return {
      success: true,
      message: "Criteria submitted successfully",
      recommendations: data || [],
    };
  } catch (error) {
    console.error("Error submitting criteria:", error);

    return {
      success: false,
      message:
        error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
}
