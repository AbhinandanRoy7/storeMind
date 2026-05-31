# cv/evaluation.py

class EvaluationModule:
    def __init__(self):
        # Manually defined ground truth based on visual inspection of the CCTV footage
        self.ground_truth = {
            "entries": 5,      # 5 distinct entry events across cameras
            "purchases": 2,    # 2 completed purchases (dwell > 20s and exit)
            "queue_joins": 4,  # 4 queue join occurrences
            "anomalies": 0     # 0 critical anomalies in normal operation
        }

    def evaluate(self, predictions: dict) -> dict:
        """
        Compares predicted values against ground truth to calculate:
        - Absolute Error
        - Accuracy Percentage
        - Precision, Recall, F1-Score (using simulated TP, FP, FN metrics)
        predictions format:
        {
            "entries": int,
            "purchases": int,
            "queue_joins": int,
            "anomalies": int
        }
        """
        results = {}
        total_accuracy = 0.0
        metrics_count = 0
        
        for metric, gt_val in self.ground_truth.items():
            pred_val = predictions.get(metric, 0)
            error = abs(pred_val - gt_val)
            accuracy = max(0.0, 1.0 - (error / max(1.0, float(gt_val))))
            
            total_accuracy += accuracy
            metrics_count += 1
            
            # Model TP, FP, FN for Precision/Recall calculation
            # True Positives: minimum of predicted and ground truth
            tp = min(pred_val, gt_val)
            # False Positives: predictions exceed ground truth
            fp = max(0, pred_val - gt_val)
            # False Negatives: ground truth exceeds predictions
            fn = max(0, gt_val - pred_val)
            
            precision = tp / (tp + fp) if (tp + fp) > 0 else 1.0
            recall = tp / (tp + fn) if (tp + fn) > 0 else 1.0
            f1 = (2 * precision * recall) / (precision + recall) if (precision + recall) > 0 else 1.0
            
            results[metric] = {
                "ground_truth": gt_val,
                "predicted": pred_val,
                "accuracy": round(accuracy * 100.0, 1),
                "precision": round(precision, 2),
                "recall": round(recall, 2),
                "f1_score": round(f1, 2)
            }
            
        avg_accuracy = round((total_accuracy / metrics_count) * 100.0, 1) if metrics_count > 0 else 100.0
        
        # Aggregate micro-averages
        total_tp = sum(min(predictions.get(m, 0), gt) for m, gt in self.ground_truth.items())
        total_fp = sum(max(0, predictions.get(m, 0) - gt) for m, gt in self.ground_truth.items())
        total_fn = sum(max(0, gt - predictions.get(m, 0)) for m, gt in self.ground_truth.items())
        
        overall_precision = total_tp / (total_tp + total_fp) if (total_tp + total_fp) > 0 else 1.0
        overall_recall = total_tp / (total_tp + total_fn) if (total_tp + total_fn) > 0 else 1.0
        overall_f1 = (2 * overall_precision * overall_recall) / (overall_precision + overall_recall) if (overall_precision + overall_recall) > 0 else 1.0

        return {
            "metrics": results,
            "overall": {
                "average_accuracy_pct": avg_accuracy,
                "precision": round(overall_precision, 2),
                "recall": round(overall_recall, 2),
                "f1_score": round(overall_f1, 2)
            }
        }

    def generate_report_string(self, predictions: dict) -> str:
        res = self.evaluate(predictions)
        overall = res["overall"]
        
        report = []
        report.append("==================================================")
        report.append("          STOREMIND AI EVALUATION REPORT          ")
        report.append("==================================================")
        report.append(f"Overall Accuracy:  {overall['average_accuracy_pct']}%")
        report.append(f"Precision:         {overall['precision']}")
        report.append(f"Recall:            {overall['recall']}")
        report.append(f"F1-Score:          {overall['f1_score']}")
        report.append("--------------------------------------------------")
        report.append(f"{'Metric':<15} | {'GT':<5} | {'Pred':<5} | {'Accuracy':<8} | {'F1':<5}")
        report.append("--------------------------------------------------")
        
        for metric, data in res["metrics"].items():
            report.append(f"{metric:<15} | {data['ground_truth']:<5} | {data['predicted']:<5} | {data['accuracy']:>7}% | {data['f1_score']:<5}")
            
        report.append("==================================================")
        return "\n".join(report)
