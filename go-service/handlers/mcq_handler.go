package handlers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"prepwise-go-service/models"
	"prepwise-go-service/services"
)

func GetMCQs(c *gin.Context) {
	topic := c.Query("topic")
	if topic == "" {
		topic = "System Design"
	}
	countStr := c.DefaultQuery("count", "5")
	count, err := strconv.Atoi(countStr)
	if err != nil || count < 1 {
		count = 5
	}
	if count > 20 {
		count = 20
	}
	mcqs := services.GetMCQsForTopic(topic, count)
	c.JSON(http.StatusOK, gin.H{"mcqs": mcqs, "topic": topic, "count": len(mcqs)})
}

func GenerateMCQs(c *gin.Context) {
	var req struct {
		Topic string `json:"topic" binding:"required"`
		Count int    `json:"count"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if req.Count == 0 { req.Count = 5 }
	mcqs := services.GetMCQsForTopic(req.Topic, req.Count)
	c.JSON(http.StatusOK, gin.H{"mcqs": mcqs})
}

func SubmitScore(c *gin.Context) {
	var req models.ScoreRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	result := services.CalculateScore(req.Score, req.Total)
	c.JSON(http.StatusOK, result)
}
