package models

type MCQOption struct {
	ID   string `json:"id"`
	Text string `json:"text"`
}

type MCQ struct {
	ID          string      `json:"id"`
	Question    string      `json:"question"`
	Options     []MCQOption `json:"options"`
	CorrectID   string      `json:"correctId"`
	Explanation string      `json:"explanation"`
	Concept     string      `json:"concept"`
	Difficulty  string      `json:"difficulty"`
}

type ScoreRequest struct {
	SessionID string `json:"sessionId"`
	Score     int    `json:"score"`
	Total     int    `json:"total"`
	Topic     string `json:"topic"`
}

type ScoreResponse struct {
	Accuracy   float64 `json:"accuracy"`
	Score      int     `json:"score"`
	Total      int     `json:"total"`
	Grade      string  `json:"grade"`
}
