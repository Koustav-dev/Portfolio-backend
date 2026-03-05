import { Response } from "express";

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?:   T;
  error?:  string;
  meta?:   { page: number; limit: number; total: number; totalPages: number };
}

export const sendSuccess = <T>(
  res: Response,
  data: T,
  statusCode = 200,
  meta?: ApiResponse["meta"]
) => {
  const response: ApiResponse<T> = { success: true, data };
  if (meta) response.meta = meta;
  return res.status(statusCode).json(response);
};

export const sendError = (
  res: Response,
  message: string,
  statusCode = 500
) => {
  return res.status(statusCode).json({ success: false, error: message });
};

export const paginationMeta = (
  page: number,
  limit: number,
  total: number
): ApiResponse["meta"] => ({
  page,
  limit,
  total,
  totalPages: Math.ceil(total / limit),
});
