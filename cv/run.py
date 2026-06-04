import argparse
from cv.pipeline import StoreMindPipeline

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Run StoreMind AI Pipeline")
    parser.add_argument("store_path", help="Path to the store folder containing videos (e.g., '../Store 1')")
    args = parser.parse_args()

    print(f"\nInitializing StoreMind Pipeline for {args.store_path}...")
    pipeline = StoreMindPipeline(backend_url="http://localhost:8000")
    
    print("\nStarting video processing. This may take a while depending on your GPU...")
    pipeline.run_real_inference(args.store_path)
    
    print("\nPipeline execution complete! All events have been sent to the backend.")
