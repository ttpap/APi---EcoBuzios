import { run } from "uebersicht";

const API = "https://ixgujnhdjrgoakqzdkgx.supabase.co/functions/v1/public-stats-api";
const API_KEY = "c04248b422b59e718e8115a66286b1f9a56f5f447b44354128ad7406ebb50752";

export const refreshFrequency = 15 * 60 * 1000; // 15 min

export const command = async (dispatch) => {
  try {
    const response = await fetch(API, {
      headers: { "x-api-key": API_KEY }
    });
    const data = await response.json();
    dispatch({
      type: "FETCH_DATA",
      payload: data
    });
  } catch (error) {
    dispatch({
      type: "FETCH_ERROR",
      payload: error.message
    });
  }
};

const initialState = {
  data: null,
  error: null
};

export const reducer = (state = initialState, action = {}) => {
  switch (action.type) {
    case "FETCH_DATA":
      return { ...state, data: action.payload, error: null };
    case "FETCH_ERROR":
      return { ...state, error: action.payload };
    default:
      return state;
  }
};

export const style = `
  .ecobuzios-widget {
    position: fixed;
    top: 20px;
    right: 20px;
    width: 320px;
    background: linear-gradient(135deg, #f8f9fa 0%, #f0f4f8 100%);
    border: 2px solid #0891b2;
    border-radius: 16px;
    padding: 16px;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    box-shadow: 0 8px 32px rgba(8, 145, 178, 0.15);
    cursor: pointer;
    transition: all 0.3s ease;
    z-index: 9999;
  }

  .ecobuzios-widget:hover {
    box-shadow: 0 12px 40px rgba(8, 145, 178, 0.25);
    transform: translateY(-2px);
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
    padding-bottom: 8px;
    border-bottom: 1px solid #e2e8f0;
  }

  .title {
    font-size: 16px;
    font-weight: 700;
    color: #0891b2;
  }

  .time {
    font-size: 11px;
    color: #94a3b8;
  }

  .big-number {
    font-size: 44px;
    font-weight: 700;
    color: #0891b2;
    line-height: 1;
    margin-bottom: 4px;
  }

  .label {
    font-size: 12px;
    color: #64748b;
    margin-bottom: 12px;
  }

  .stat-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 12px;
    padding: 8px 0;
    border-bottom: 1px solid #e2e8f0;
  }

  .stat-row:last-of-type {
    border-bottom: none;
  }

  .stat-label {
    color: #475569;
    font-weight: 500;
  }

  .stat-value {
    color: #f59e0b;
    font-weight: 600;
  }

  .projects-title {
    font-size: 11px;
    font-weight: 700;
    color: #0891b2;
    margin-top: 12px;
    margin-bottom: 8px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .project-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 11px;
    padding: 6px 0;
    color: #1e293b;
  }

  .project-name {
    flex: 1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .project-value {
    color: #f59e0b;
    font-weight: 600;
    margin-left: 8px;
  }

  .error {
    color: #ef4444;
    font-size: 12px;
    text-align: center;
    padding: 16px;
  }
`;

export const render = ({ data, error }) => {
  if (error) {
    return (
      <div className="ecobuzios-widget">
        <div className="error">Erro ao carregar dados</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="ecobuzios-widget">
        <div className="label">Carregando...</div>
      </div>
    );
  }

  const time = new Date(data.gerado_em).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit"
  });

  const instit = data.instituicao?.find(i => i.name === "Pública");
  const pctPublico = instit
    ? Math.round((instit.value / data.total_alunos_em_turmas) * 100)
    : 0;

  return (
    <div
      className="ecobuzios-widget"
      onClick={() => {
        require("child_process").exec(
          `open "https://a-pi-eco-buzios.vercel.app/"`
        );
      }}
    >
      <div className="header">
        <div className="title">ECOBUZIOS</div>
        <div className="time">{time}</div>
      </div>

      <div className="big-number">{data.total_alunos_em_turmas}</div>
      <div className="label">alunos em turmas</div>

      <div className="stat-row">
        <span className="stat-label">Escolas Públicas</span>
        <span className="stat-value">
          {pctPublico}% ({instit?.value || 0})
        </span>
      </div>

      {data.por_projeto && data.por_projeto.length > 0 && (
        <>
          <div className="projects-title">Por Projeto</div>
          {data.por_projeto.slice(0, 2).map((p, i) => (
            <div key={i} className="project-item">
              <span className="project-name">{p.name.substring(0, 28)}</span>
              <span className="project-value">{p.value}</span>
            </div>
          ))}
        </>
      )}
    </div>
  );
};
