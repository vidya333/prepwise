package main

import (
	"log"
	"os"

	"github.com/gin-gonic/gin"
	"prepwise-go-service/handlers"
)

func main() {
	r := gin.Default()

	r.Use(func(c *gin.Context) {
		c.Header("Access-Control-Allow-Origin", "*")
		c.Header("Access-Control-Allow-Methods", "GET,POST,OPTIONS")
		c.Header("Access-Control-Allow-Headers", "Content-Type,Authorization")
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}
		c.Next()
	})

	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok", "service": "go-mcq-engine"})
	})

	r.GET("/mcq", handlers.GetMCQs)
	r.POST("/mcq/generate", handlers.GenerateMCQs)
	r.POST("/mcq/score", handlers.SubmitScore)

	port := os.Getenv("PORT")
	if port == "" {
		port = "9000"
	}
	log.Printf("Go MCQ service starting on :%s", port)
	r.Run(":" + port)
}
