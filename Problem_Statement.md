# Nutri-Track: AI Food Calorie Estimator

## 1. Introduction
With the growing awareness of health and fitness, tracking daily nutritional intake has become essential for many individuals. However, traditional calorie counting and meal logging apps are tedious. Users are required to manually search for food items, guess portion sizes, and calculate nutritional values, leading to inaccurate tracking and high abandonment rates.

## 2. Problem Statement
**"Despite the increasing emphasis on personal health and nutrition, existing dietary tracking methods remain manual, time-consuming, and prone to human error, resulting in inaccurate macro-nutrient logging and poor long-term adherence."**

Most nutrition applications fail to provide a frictionless user experience because they rely entirely on user estimation. There is a lack of an accessible, highly accurate automated solution that bridges the gap between simply taking a picture of a meal and receiving instant, reliable nutritional metrics (calories, protein, carbohydrates, and fats).

## 3. The Proposed Solution (Nutri-Track)
Nutri-Track solves this problem by automating the dietary logging process using computer vision and machine learning. 

By simply uploading an image of their meal, the system seamlessly:
1. **Detects & Recognizes:** Utilizes a state-of-the-art YOLOv8 object detection model to identify the specific food items present on the plate.
2. **Analyzes:** Interfaces with a nutritional database to instantly estimate the caloric and macronutrient (e.g., protein) composition of the detected food.
3. **Tracks & visualizes:** Records the data into a minimalist, user-friendly SaaS dashboard powered by React and Node.js, allowing users to effortlessly monitor their daily fitness goals without the cognitive load of manual data entry.

## 4. Objectives for Report & Presentation

* **Primary Objective:** To develop a full-stack, AI-powered web application capable of recognizing common food items from images and calculating their approximate caloric and protein values.
* **Technical Objective:** To successfully integrate a Machine Learning vision model (PyTorch/YOLO) with a scalable backend (Node.js/Express) and a modern, responsive frontend client (React/Vite).
* **User Experience Objective:** To design a clean, distraction-free "monochrome" user interface that encourages long-term tracking adherence by reducing the time spent actively logging meals to under 5 seconds.

## 5. Scope & Target Audience
* **Target Audience:** Fitness enthusiasts, individuals managing specific dietary requirements, and anyone looking for a low-effort method to track daily nutrition.
* **Scope:** The system currently handles single-image uploads, classifies food items based on a custom-trained dataset, estimates macros, and persists user history in a MongoDB database with a daily reset capability.
