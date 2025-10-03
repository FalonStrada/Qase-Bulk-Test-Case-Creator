import axios, { AxiosInstance } from 'axios';

// ========== TYPES & INTERFACES ==========

export enum Severity {
  Blocker = 1,
  Critical = 2,
  Major = 3,
  Normal = 4,
  Minor = 5,
  Trivial = 6
}

export enum Priority {
  High = 1,
  Medium = 2,
  Low = 3
}

export enum TestType {
  Other = 1,
  Functional = 2,
  Smoke = 3,
  Regression = 4,
  Security = 5,
  Usability = 6,
  Performance = 7,
  Acceptance = 8
}

export enum Layer {
  E2E = 1,
  API = 2,
  Unit = 3
}

export enum Automation {
  NotAutomated = 0,
  Automated = 1,
  ToBeAutomated = 2
}

export enum Status {
  Actual = 0,
  Draft = 1,
  Deprecated = 2
}

export interface TestStep {
  action: string;
  expected_result: string;
  data?: string;
}

export interface CreateTestCasePayload {
  title: string;
  description?: string;
  severity?: Severity;
  priority?: Priority;
  type?: TestType;
  layer?: Layer;
  automation?: Automation;
  status?: Status;
  suite_id?: number;
  steps?: TestStep[];
  preconditions?: string;
  postconditions?: string;
  tags?: string[];
  custom_field?: Record<string, any>;
}

export interface UpdateTestCasePayload {
  title?: string;
  description?: string;
  severity?: Severity;
  priority?: Priority;
  type?: TestType;
  layer?: Layer;
  automation?: Automation;
  status?: Status;
  suite_id?: number;
  steps?: TestStep[];
  preconditions?: string;
  postconditions?: string;
  tags?: string[];
}

export interface TestCase {
  id: number;
  title: string;
  description: string;
  severity: Severity;
  priority: Priority;
  type: TestType;
  layer: Layer;
  automation: Automation;
  status: Status;
  suite_id: number | null;
  steps: TestStep[];
  preconditions: string;
  postconditions: string;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface QaseResponse<T> {
  status: boolean;  
  code: number;
  message: string;
  result: T;
}

// ========== QASE API CLIENT ==========

export class QaseAPI {
  private client: AxiosInstance;
  private projectCode: string;

  constructor(apiToken: string, projectCode: string) {
    this.projectCode = projectCode;
    this.client = axios.create({
      baseURL: 'https://api.qase.io/v1',
      headers: {
        'Token': apiToken,
        'Content-Type': 'application/json'
      }
    });
  }

  async createTestCase(payload: CreateTestCasePayload): Promise<TestCase | null> {
    try {
      const response = await this.client.post<QaseResponse<TestCase>>(
        `/case/${this.projectCode}`,
        payload
      );
      console.log(`✅ Test case creado: ${payload.title}`);
      return response.data.result;
    } catch (error) {
      this.handleError(error, 'crear test case');
      return null;
    }
  }

  async createTestCasesBatch(testCases: CreateTestCasePayload[]): Promise<(TestCase | null)[]> {
    const results: (TestCase | null)[] = [];
    
    for (const testCase of testCases) {
      const result = await this.createTestCase(testCase);
      results.push(result);
      // Pausa entre requests para evitar rate limiting
      await this.sleep(100);
    }
    
    return results;
  }

  async createSuite(payload: { title: string; description?: string }): Promise<any> {
    try {
      const response = await this.client.post(
        `/suite/${this.projectCode}`,
        payload
      );
      console.log(`✅ Suite creada: ${payload.title}`);
      return response.data.result;
    } catch (error) {
      this.handleError(error, 'crear suite');
      return null;
    }
  }

  private handleError(error: any, action: string): void {
    if (axios.isAxiosError(error)) {
      console.error(`❌ Error al ${action}:`, {
        status: error.response?.status,
        message: error.response?.data?.errorMessage || error.message
      });
    } else {
      console.error(`❌ Error inesperado al ${action}:`, error);
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}