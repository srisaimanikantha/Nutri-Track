from ultralytics import YOLO

try:
    # Initialize YOLO-World model
    model = YOLO('yolov8s-world.pt')  # or 'yolov8m-world.pt'

    # Define custom classes
    custom_classes = [
        "apple", "banana", "pizza", "hot dog", "sandwich", 
        "donut", "cake", "orange", "carrot", "broccoli", 
        "rice", "dal", "roti"
    ]
    model.set_classes(custom_classes)

    print("YOLO-World loaded successfully and custom classes set.")
    print("Classes:", model.names)
except Exception as e:
    print(f"Error: {e}")
