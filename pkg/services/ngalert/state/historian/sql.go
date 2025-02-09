package historian

import (
	"context"

	"github.com/grafana/grafana-plugin-sdk-go/data"
	"github.com/grafana/grafana/pkg/infra/log"
	"github.com/grafana/grafana/pkg/services/ngalert/models"
	"github.com/grafana/grafana/pkg/services/ngalert/state"
)

type SqlBackend struct {
	log log.Logger
}

func NewSqlBackend() *SqlBackend {
	return &SqlBackend{
		log: log.New("ngalert.state.historian"),
	}
}

func (h *SqlBackend) RecordStatesAsync(ctx context.Context, _ *models.AlertRule, _ []state.StateTransition) {
}

func (h *SqlBackend) QueryStates(ctx context.Context, query models.HistoryQuery) (*data.Frame, error) {
	return data.NewFrame("states"), nil
}
