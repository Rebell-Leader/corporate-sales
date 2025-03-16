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

const mockEmails: RFQEmail[] = [
  {
    category: "Laptops",
    subject: "RFQ: 35 Lenovo 100w Gen 4 Laptops for Government Tender",
    to: "sales@lenovo.com",
    content: `Dear Lenovo Sales Team,

I am writing to request a quotation for 35 Lenovo 100w Gen 4 laptops for a government tender. The specifications we require are:

• Screen: 13.3" display
• RAM: 16GB
• Storage: 512GB
• Processor: Intel Processor N100
• Operating System: Windows 11
• Battery: 47Wh

Please provide:
1. Unit price and total cost for 35 units
2. Delivery timeline
3. Warranty terms
4. Support options
5. Bulk order discounts if applicable

We need this quotation by the end of next week for our tender submission.

Best regards,
[Your name]`,
  },
  {
    category: "Monitors",
    subject: "RFQ: 20 Dell UltraSharp U2723QE Monitors",
    to: "dell.commercial@dell.com",
    content: `Dear Dell Commercial Team,

I am requesting a quotation for 20 Dell UltraSharp U2723QE monitors with the following specifications:

• Resolution: 3840x2160
• Panel Type: IPS
• Size: 27"
• Ports: HDMI, DisplayPort, USB-C
• Response Time: 5ms
• Brightness: 350cd/m²

Please include in your quotation:
1. Unit price and total cost for 20 units
2. Estimated delivery time
3. Warranty information
4. Installation support options
5. Volume discount details

We require this quotation within 5 business days.

Best regards,
[Your name]`,
  },
  {
    category: "Network Switches",
    subject: "RFQ: 8 Cisco Catalyst 9200-48P Network Switches",
    to: "cisco.sales@cisco.com",
    content: `Dear Cisco Sales Team,

I am writing to request a quotation for 8 Cisco Catalyst 9200-48P Network Switches with the following specifications:

• 48 Ports
• 10GbE Speed
• PoE+ Support
• Switching Capacity: 176 Gbps
• Full Management Capabilities
• Stacking Support
• Power Budget: 740W

Please provide the following information:
1. Unit price and total cost for 8 units
2. Lead time for delivery
3. Warranty and support terms
4. Installation services available
5. Training options for our IT team

We need this quotation within the next 7 business days.

Best regards,
[Your name]`,
  },
];

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
