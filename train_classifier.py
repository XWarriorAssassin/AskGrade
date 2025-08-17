import json
import pickle
from models.nlp_processor import TeacherIntentClassifier

# Load training data
with open('data/training_data.json', 'r') as f:
    data = json.load(f)

x_train = []
y_train = []
for intent, samples in data.items():
    for sample in samples:
        x_train.append(sample.lower())
        y_train.append(intent)

classifier = TeacherIntentClassifier()
classifier.train(x_train, y_train)

# Save the trained classifier with pickle
with open('data/model.pkl', 'wb') as f:
    pickle.dump(classifier, f)

print("Training complete. Model saved to data/model.pkl")
