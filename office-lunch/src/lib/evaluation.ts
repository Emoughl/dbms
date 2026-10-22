import { datasetStats } from "./mock-data";

// KẾT QUẢ GIẢ LẬP để dựng giao diện màn Đánh giá mô hình.
// Thay bằng kết quả chạy thật khi làm phần thực nghiệm. Thiết lập theo code gốc Trans2Vec:
// PV-DBOW 128 chiều, 50 epoch, LinearSVC, chia cố định 3200 train / 800 test, trung bình 10 lần chạy.
// Chỉ datasetStats là số thật.

export interface MethodResult {
  method: string;
  group: "baseline" | "trans2vec";
  accuracy: number;
  f1: number;
  trainSeconds: number;
}

export const evaluation = {
  simulated: true,
  dataset: datasetStats,
  split: { train: 3200, test: 800, runs: 10 },
  methods: [
    { method: "Bag-of-items + LinearSVC", group: "baseline", accuracy: 0.712, f1: 0.709, trainSeconds: 4 },
    { method: "PV-DBOW (chỉ items)", group: "baseline", accuracy: 0.768, f1: 0.766, trainSeconds: 35 },
    { method: "PV-DBOW (chỉ tập phổ biến)", group: "baseline", accuracy: 0.752, f1: 0.75, trainSeconds: 22 },
    { method: "Trans2Vec-Ind", group: "trans2vec", accuracy: 0.801, f1: 0.8, trainSeconds: 52 },
    { method: "Trans2Vec-Joi", group: "trans2vec", accuracy: 0.814, f1: 0.813, trainSeconds: 61 },
  ] satisfies MethodResult[],
  // Độ chính xác theo ngưỡng minsup của tập phổ biến (khớp tên file food_*_fis_<minsup>.txt)
  minsup: [
    { minsup: 0.002, ind: 0.806, joi: 0.817 },
    { minsup: 0.003, ind: 0.804, joi: 0.816 },
    { minsup: 0.004, ind: 0.801, joi: 0.814 },
    { minsup: 0.005, ind: 0.797, joi: 0.811 },
    { minsup: 0.006, ind: 0.792, joi: 0.806 },
    { minsup: 0.007, ind: 0.788, joi: 0.801 },
    { minsup: 0.008, ind: 0.783, joi: 0.797 },
    { minsup: 0.009, ind: 0.779, joi: 0.792 },
    { minsup: 0.01, ind: 0.774, joi: 0.788 },
  ],
  // Ma trận nhầm lẫn trên tập test (800 giao dịch) của Trans2Vec-Joi
  confusion: { tp: 329, fn: 71, fp: 78, tn: 322 },
  qdrant: { collection: "transactions", vectors: 4000, dimension: 128, distance: "Cosine", k: 15 },
};

export type Evaluation = typeof evaluation;
