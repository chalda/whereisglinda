package logger

import (
	"fmt"
	"io"
	"os"
	"time"

	"github.com/rs/zerolog"
)

var Log zerolog.Logger
var AccessLog zerolog.Logger

// InitLogger initializes the main application logger (stdout) and the access logger (stdout + file).
func InitLogger(logLevel string) {

	level, err := zerolog.ParseLevel(logLevel)
	if err != nil {
		fmt.Println("Error parsing log level:", err)
		level = zerolog.InfoLevel
	}

	zerolog.TimeFieldFormat = time.RFC3339
	Log = zerolog.New(os.Stdout).Level(level).With().Timestamp().Caller().Logger()

	accessLogFile, err := os.OpenFile("access.log", os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0644)
	if err != nil {
		// Fallback to stdout only if file can't be opened
		AccessLog = zerolog.New(os.Stdout).With().Timestamp().Logger()
		Log.Error().Err(err).Msg("Failed to open access.log for writing, using stdout only for access log")
	} else {
		multi := io.MultiWriter(os.Stdout, accessLogFile)
		AccessLog = zerolog.New(multi).With().Timestamp().Logger()
	}
}
