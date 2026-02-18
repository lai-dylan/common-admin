import type { Filters, QueryPayload } from "@/components/common/types";
import { http } from "./request";

interface ReportFiltersInput {
  keyword?: unknown;
  minVisits?: unknown;
  reportType?: unknown;
  relatedSystems?: unknown;
  department?: unknown;
  periodsAny?: unknown;
  enabled?: unknown;
  createdRange?: unknown;
}

interface QueryResponseData {
  rows: unknown[];
  total: number;
}

interface DeleteResponseData {
  deleted: number;
}

interface ApiResponse<T> {
  code: number;
  data: T;
  message: string;
}

function toNumberArray(value: unknown): number[] {
  if (!Array.isArray(value)) return [];
  return value.map((item) => Number(item)).filter((item) => Number.isFinite(item));
}

function toIsoString(value: unknown): string | null {
  if (value instanceof Date) {
    return Number.isFinite(value.getTime()) ? value.toISOString() : null;
  }
  if (typeof value === "string" || typeof value === "number") {
    const date = new Date(value);
    return Number.isFinite(date.getTime()) ? date.toISOString() : null;
  }
  return null;
}

export async function getReports(payload: QueryPayload<Filters>) {
  const { pagination, sort, filters } = payload;
  const body: Filters = {
    page: pagination.page,
    pageSize: pagination.pageSize,
  };
  const typedFilters = filters as ReportFiltersInput;

  if (sort?.prop && sort?.order) {
    body.sortProp = sort.prop;
    body.sortOrder = sort.order;
  }
  if (typedFilters.keyword) body.keyword = typedFilters.keyword;
  if (
    typedFilters.minVisits !== undefined &&
    typedFilters.minVisits !== null &&
    typedFilters.minVisits !== ""
  ) {
    body.minVisits = typedFilters.minVisits;
  }
  if (typedFilters.reportType) body.reportType = typedFilters.reportType;
  if (Array.isArray(typedFilters.relatedSystems) && typedFilters.relatedSystems.length > 0) {
    body.relatedSystems = toNumberArray(typedFilters.relatedSystems);
  }
  if (Array.isArray(typedFilters.department) && typedFilters.department.length > 0) {
    body.departments = toNumberArray(typedFilters.department);
  } else if (typeof typedFilters.department === "string" && typedFilters.department) {
    body.department = typedFilters.department;
  }
  if (Array.isArray(typedFilters.periodsAny) && typedFilters.periodsAny.length > 0) {
    body.periods = toNumberArray(typedFilters.periodsAny);
  }
  if (typedFilters.enabled !== undefined) body.enabled = typedFilters.enabled;
  if (Array.isArray(typedFilters.createdRange) && typedFilters.createdRange.length === 2) {
    const [start, end] = typedFilters.createdRange;
    const startIso = toIsoString(start);
    const endIso = toIsoString(end);
    if (startIso) body.createdStart = startIso;
    if (endIso) body.createdEnd = endIso;
  }

  const resp = await http
    .post("reports/query", { json: body })
    .json<ApiResponse<QueryResponseData>>();
  const data = resp?.data ?? { rows: [], total: 0 };
  return { rows: data.rows, total: Number(data.total) || 0 };
}

export async function deleteReports(ids: Array<number | string>) {
  const resp = await http
    .post("reports/delete", { json: { ids } })
    .json<ApiResponse<DeleteResponseData>>();
  return resp?.data ?? { deleted: 0 };
}

export async function getReportTypes() {
  const resp = await http.get("reports/types").json<ApiResponse<string[]>>();
  return Array.isArray(resp?.data) ? resp.data : [];
}
