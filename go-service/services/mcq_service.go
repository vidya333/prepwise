package services

import (
	"fmt"
	"sync"
	"prepwise-go-service/models"
)

// In-memory cache for MCQs per topic
var cache = struct {
	sync.RWMutex
	data map[string][]models.MCQ
}{data: make(map[string][]models.MCQ)}

// GetMCQsForTopic returns cached or generated MCQs
func GetMCQsForTopic(topic string, count int) []models.MCQ {
	cache.RLock()
	cached, ok := cache.data[topic]
	cache.RUnlock()

	if ok && len(cached) >= count {
		return cached[:count]
	}

	// Generate sample MCQs (in production: call Claude API)
	mcqs := generateSampleMCQs(topic, count)

	cache.Lock()
	cache.data[topic] = mcqs
	cache.Unlock()

	return mcqs
}

func generateSampleMCQs(topic string, count int) []models.MCQ {
	base := []models.MCQ{
		{
			ID:       "mcq-1",
			Question: fmt.Sprintf("What is the primary purpose of %s in system design?", topic),
			Options: []models.MCQOption{
				{ID: "a", Text: "To improve scalability and performance"},
				{ID: "b", Text: "To reduce code complexity"},
				{ID: "c", Text: "To simplify the database schema"},
				{ID: "d", Text: "To increase network latency"},
			},
			CorrectID:   "a",
			Explanation: fmt.Sprintf("%s primarily helps improve scalability and performance in distributed systems.", topic),
			Concept:     topic,
			Difficulty:  "medium",
		},
		{
			ID:       "mcq-2",
			Question: "Which cache eviction policy removes the least recently used item?",
			Options: []models.MCQOption{
				{ID: "a", Text: "FIFO"},
				{ID: "b", Text: "LRU"},
				{ID: "c", Text: "LFU"},
				{ID: "d", Text: "Random"},
			},
			CorrectID:   "b",
			Explanation: "LRU (Least Recently Used) evicts items that haven't been accessed for the longest time.",
			Concept:     "Caching",
			Difficulty:  "easy",
		},
		{
			ID:       "mcq-3",
			Question: "In CAP theorem, what does 'P' stand for?",
			Options: []models.MCQOption{
				{ID: "a", Text: "Performance"},
				{ID: "b", Text: "Persistence"},
				{ID: "c", Text: "Partition tolerance"},
				{ID: "d", Text: "Priority"},
			},
			CorrectID:   "c",
			Explanation: "P in CAP stands for Partition tolerance — the system continues operating despite network partitions.",
			Concept:     "Distributed Systems",
			Difficulty:  "easy",
		},
		{
			ID:       "mcq-4",
			Question: "Which load balancing algorithm distributes requests based on server capacity?",
			Options: []models.MCQOption{
				{ID: "a", Text: "Round Robin"},
				{ID: "b", Text: "Weighted Round Robin"},
				{ID: "c", Text: "Random"},
				{ID: "d", Text: "IP Hash"},
			},
			CorrectID:   "b",
			Explanation: "Weighted Round Robin assigns more requests to servers with higher capacity/weight values.",
			Concept:     "Load Balancing",
			Difficulty:  "medium",
		},
		{
			ID:       "mcq-5",
			Question: "What is the main advantage of consistent hashing?",
			Options: []models.MCQOption{
				{ID: "a", Text: "Simpler implementation"},
				{ID: "b", Text: "Minimises key redistribution when nodes are added/removed"},
				{ID: "c", Text: "Faster read operations"},
				{ID: "d", Text: "Reduces memory usage"},
			},
			CorrectID:   "b",
			Explanation: "Consistent hashing ensures only K/N keys need to be remapped when a node is added or removed, where K=keys and N=nodes.",
			Concept:     "Consistent Hashing",
			Difficulty:  "hard",
		},
	}

	if count > len(base) {
		count = len(base)
	}
	return base[:count]
}

func CalculateScore(score, total int) models.ScoreResponse {
	accuracy := 0.0
	if total > 0 {
		accuracy = float64(score) / float64(total) * 100
	}
	grade := "F"
	switch {
	case accuracy >= 90: grade = "A"
	case accuracy >= 80: grade = "B"
	case accuracy >= 70: grade = "C"
	case accuracy >= 60: grade = "D"
	}
	return models.ScoreResponse{Accuracy: accuracy, Score: score, Total: total, Grade: grade}
}
