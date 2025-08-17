from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
import nltk
from nltk.corpus import stopwords

class TeacherIntentClassifier:
    def __init__(self):
        self.vectorizer = TfidfVectorizer(stop_words=stopwords.words('english'))
        self.classifier = MultinomialNB()
        self.trained = False

    def train(self, x_train, y_train):
        X = self.vectorizer.fit_transform(x_train)
        self.classifier.fit(X, y_train)
        self.trained = True

    def predict_intent(self, query):
        if not self.trained:
            return "unknown", 0.0
        X = self.vectorizer.transform([query])
        proba = self.classifier.predict_proba(X)[0]
        idx = proba.argmax()
        intent = self.classifier.classes_[idx]
        confidence = proba[idx]
        return intent, confidence
