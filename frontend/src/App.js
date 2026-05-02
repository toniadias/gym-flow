import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [workout, setWorkout] = useState(null);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [detalhesEquipamentos, setDetalhesEquipamentos] = useState({});

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:3001/login', {
        email,
        senha,
      });
      const loggedUser = response.data;
      localStorage.setItem('token', loggedUser.token);
      setUser(loggedUser);

      if (loggedUser.role === 'ALUNO') {
        fetchWorkout(loggedUser.id);
      }
    } catch (err) {
      alert('Erro no login');
    }
  };

  const fetchWorkout = async (usuarioId) => {
    try {
      const token = localStorage.getItem('token');

      const response = await axios.get(
        `http://localhost:3001/treinos?usuarioId=${usuarioId}`,
        {
          headers: {
            Authorization: token,
          },
        },
      );

      if (response.data.length > 0) {
        setWorkout(response.data[0]);
      }

      setLoading(false);
    } catch (error) {
      console.error('Erro ao buscar treino:', error);
      setLoading(false);
    }
    //ANTES TOKEN
    // try {
    //   const response = await axios.get(
    //     `http://localhost:3001/treinos?usuarioId=${usuarioId}`,
    //   );

    //   console.log('Resposta do Servidor:', response.data);
    //   if (response.data.length > 0) {
    //     setWorkout(response.data[0]);
    //   }
    //   setLoading(false);
    // } catch (error) {
    //   console.error('Erro ao buscar treino:', error);
    //   setLoading(false);
    // }
  };

  const fetchReport = async (alunoId) => {
    try {
      const token = localStorage.getItem('token');

      const response = await axios.get(
        `http://localhost:3001/relatorios/performance?usuarioId=${alunoId}`,
        {
          headers: {
            Authorization: token,
          },
        },
      );

      setReport(response.data);
    } catch (error) {
      console.error('Erro ao buscar performance', error);
    }
    //ANTES TOKEN
    // try {
    //   const response = await axios.get(
    //     `http://localhost:3001/relatorios/performance?usuarioId=${alunoId}`,
    //   );
    //   console.log('Resposta da API (Performance):', response.data);
    //   setReport(response.data);
    // } catch (error) {
    //   console.error('Erro ao buscar performance', error);
    // }
  };

  const handleFeedback = async (type, status) => {
    const token = localStorage.getItem('token');

    try {
      const escalaBorg = {
        'Muito leve': 0,
        Moderado: 5,
        Forte: 7,
        'Muito forte': 10,
      };

      const notaPSR = {
        'Muito cansado': 0,
        Recuperado: 5,
        'Pronto pra próxima': 10,
      };

      let response;
      if (type === 'immediate') {
        const detalhesArray = workout.equipamentos.map((item) => ({
          equipamentoId: item.equipamentoId,
          pesoRealizado:
            detalhesEquipamentos[item.equipamentoId]?.pesoRealizado ??
            item.cargaPlanejada,
          repeticoes:
            detalhesEquipamentos[item.equipamentoId]?.repeticoes ?? 10,
          series: detalhesEquipamentos[item.equipamentoId]?.series ?? 3,
        }));

        response = await axios.post(
          'http://localhost:3001/feedbacks/finalizar',
          {
            treinoId: workout.id,
            pse: escalaBorg[status] ?? 5,
            statusPSE: status,
            detalhesEquipamentos: detalhesArray,
          },
          {
            headers: {
              Authorization: token,
            },
          },
        );

        //ANTES TOKEN
        // response = await axios.post(
        //   'http://localhost:3001/feedbacks/finalizar',
        //   {
        //     treinoId: workout.id,
        //     pse: escalaBorg[status] ?? 5,
        //     statusPSE: status,
        //     detalhesEquipamentos: detalhesArray,
        //   },
        // );
      } else {
        response = await axios.patch(
          `http://localhost:3001/feedbacks/${workout.id}`,
          {
            notaRecuperacao: notaPSR[status] ?? 5,
            status: status,
          },
          {
            headers: {
              Authorization: token,
            },
          },
        );
        //ANTES TOKEN
        // response = await axios.patch(
        //   `http://localhost:3001/feedbacks/${workout.id}`,
        //   {
        //     notaRecuperacao: notaPSR[status] ?? 5,
        //     status: status,
        //   },
        // );
      }

      if (response.data) {
        setWorkout(response.data);
        setShowFeedbackForm(false);
        setDetalhesEquipamentos({});
      }
    } catch (error) {
      console.error('Erro detalhado:', error.response?.data || error.message);
      alert('Erro ao sincronizar. Verifique a conexão.');
    }
  };

  const diferencaHoras = () => {
    const dataReferencia = workout?.dataFeedback;

    if (!dataReferencia) return 0;

    const dataGravadaMs = new Date(dataReferencia).getTime();
    const agoraMs = new Date().getTime();

    const diffMs = agoraMs - dataGravadaMs;
    const diffHoras = diffMs / (1000 * 60 * 60);

    console.log('--- DEBUG DE TEMPO ---');
    console.log('Data capturada:', dataReferencia);
    console.log('Horas passadas:', diffHoras.toFixed(2));

    return diffHoras;
  };

  const podeResponder24h = () => {
    return workout?.status === 'CONCLUIDO' && diferencaHoras() >= 24;
  };

  const handleIniciarTreino = async () => {
    try {
      const token = localStorage.getItem('token');

      const response = await axios.patch(
        `http://localhost:3001/treinos/${workout.id}/iniciar`,
        {},
        {
          headers: {
            Authorization: token,
          },
        },
      );

      setWorkout(response.data);
    } catch (error) {
      console.error('Erro ao iniciar sessão', error);
    }
    //ANTES TOKEN
    // try {
    //   const response = await axios.patch(
    //     `http://localhost:3001/treinos/${workout.id}/iniciar`,
    //   );
    //   setWorkout(response.data);
    // } catch (error) {
    //   console.error('Erro ao iniciar sessão', error);
    // }
  };

  const handleUpdateDetalhe = (equipamentoId, campo, valor) => {
    setDetalhesEquipamentos((prev) => ({
      ...prev,
      [equipamentoId]: {
        ...prev[equipamentoId],
        equipamentoId,
        [campo]: parseInt(valor) || 0,
      },
    }));
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen bg-[#0A0A0C] text-white font-light tracking-widest">
        Carregando...
      </div>
    );

  if (!user)
    return (
      <LoginScreen
        email={email}
        setEmail={setEmail}
        senha={senha}
        setSenha={setSenha}
        handleLogin={handleLogin}
      />
    );

  if (user.role === 'PROFESSOR') {
    return (
      <ProfessorDashboard
        user={user}
        report={report}
        setReport={setReport}
        fetchReport={fetchReport}
        onLogout={() => setUser(null)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0C] text-white p-8 font-sans antialiased selection:bg-purple-500/30">
      <div className="max-w-md mx-auto">
        <header className="flex justify-between items-center mb-16 pt-4">
          <h1 className="text-2xl font-light tracking-[0.5em] uppercase text-white/90">
            Gym<span className="font-bold text-purple-500">Flow</span>
          </h1>
          <button
            onClick={() => setUser(null)}
            className="text-[10px] text-white/20 font-bold uppercase tracking-[0.2em] hover:text-white transition-all"
          >
            Sair
          </button>
        </header>

        {/* 2. EQUIPAMENTOS: visíveis durante todo o ciclo de vida do treino */}
        {workout && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <div className="mb-12 pl-2">
              <div className="flex justify-between items-start">
                <h2 className="text-3xl font-light text-white/95 tracking-tight">
                  {workout.exercise}
                </h2>
                <span
                  className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest transition-all duration-500 ${
                    workout.status === 'EM_ANDAMENTO'
                      ? 'bg-green-500/20 text-green-400 animate-pulse'
                      : 'bg-white/5 text-white/40'
                  }`}
                >
                  {workout.status || 'PENDENTE'}
                </span>
              </div>

              <div className="h-1 w-12 bg-gradient-to-r from-purple-500 to-pink-500 mt-4 rounded-full"></div>

              {/* 1. Informação de Intensidade */}
              <p className="text-[11px] text-white/30 uppercase tracking-[0.2em] mt-6">
                Intensidade:{' '}
                <span className="text-purple-400/80">
                  {workout.prescribed_intensity}
                </span>
              </p>

              {/* 2. EQUIPAMENTOS: visíveis ANTES e DURANTE o treino */}
              {workout?.equipamentos?.length > 0 && (
                <div className="mt-8 animate-in fade-in slide-in-from-left-4 duration-700">
                  <h4 className="text-[10px] text-white/30 uppercase tracking-[0.2em] mb-4 opacity-50">
                    Configuração das Máquinas:
                  </h4>
                  <div className="flex flex-col gap-3">
                    {workout.equipamentos.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between gap-4 px-4 py-4 bg-white/[0.03] border border-white/10 rounded-2xl hover:border-purple-500/30 transition-all group"
                      >
                        {/* Lado Esquerdo: Identificação do Exercício */}
                        <div className="flex items-center gap-4">
                          <div className="flex flex-col items-center border-r border-white/10 pr-3">
                            <span className="text-[14px] font-black text-purple-500 leading-none">
                              {item.cargaPlanejada}
                            </span>
                            <span className="text-[7px] text-white/30 uppercase font-bold tracking-tighter">
                              kg
                            </span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[11px] font-bold text-white/90 tracking-wide group-hover:text-purple-400 transition-colors">
                              {item.equipamento?.nome}
                            </span>
                            <span className="text-[9px] text-white/30 font-medium uppercase tracking-tighter">
                              {item.equipamento?.musculoAlvo || 'Geral'}
                            </span>
                          </div>
                        </div>

                        {/* Lado Direito: Inputs de Performance (Acessíveis apenas EM_ANDAMENTO) */}
                        <div className="flex gap-2 items-center bg-black/20 p-2 rounded-xl border border-white/5">
                          <div className="flex flex-col gap-1">
                            <span className="text-[7px] text-white/40 uppercase text-center font-bold">
                              Séries
                            </span>
                            <input
                              type="number"
                              defaultValue={item.series || 3}
                              disabled={workout.status !== 'EM_ANDAMENTO'}
                              onChange={(e) =>
                                handleUpdateDetalhe(
                                  item.equipamentoId,
                                  'series',
                                  e.target.value,
                                )
                              }
                              className={`w-8 bg-transparent text-center text-[11px] font-bold outline-none transition-colors
                  ${workout.status === 'EM_ANDAMENTO' ? 'text-white focus:text-purple-400' : 'text-white/20'}`}
                            />
                          </div>
                          <div className="w-[1px] h-4 bg-white/10" />
                          <div className="flex flex-col gap-1">
                            <span className="text-[7px] text-white/40 uppercase text-center font-bold">
                              Reps
                            </span>
                            <input
                              type="number"
                              defaultValue={item.repeticoes || 10}
                              disabled={workout.status !== 'EM_ANDAMENTO'}
                              onChange={(e) =>
                                handleUpdateDetalhe(
                                  item.equipamentoId,
                                  'repeticoes',
                                  e.target.value,
                                )
                              }
                              className={`w-8 bg-transparent text-center text-[11px] font-bold outline-none transition-colors
                  ${workout.status === 'EM_ANDAMENTO' ? 'text-white focus:text-purple-400' : 'text-white/20'}`}
                            />
                          </div>
                          <div className="w-[1px] h-4 bg-white/10" />
                          <div className="flex flex-col gap-1">
                            <span className="text-[7px] text-white/40 uppercase text-center font-bold">
                              Peso Real
                            </span>
                            <input
                              type="number"
                              placeholder={item.cargaPlanejada}
                              defaultValue={item.pesoRealizado}
                              disabled={workout.status !== 'EM_ANDAMENTO'}
                              onChange={(e) =>
                                handleUpdateDetalhe(
                                  item.equipamentoId,
                                  'pesoRealizado',
                                  e.target.value,
                                )
                              }
                              className={`w-10 bg-transparent text-center text-[11px] font-bold outline-none transition-colors
                  ${workout.status === 'EM_ANDAMENTO' ? 'text-white border-b border-purple-500/30' : 'text-white/20'}`}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* BOTÃO INICIAR: Aparece apenas se o status for PENDENTE */}
              {workout.status === 'PENDENTE' && (
                <button
                  onClick={handleIniciarTreino}
                  className="mt-8 w-full py-4 bg-purple-600 hover:bg-purple-500 text-white text-[11px] font-black uppercase tracking-[0.2em] rounded-2xl transition-all shadow-lg shadow-purple-500/20 active:scale-95"
                >
                  Iniciar Sessão
                </button>
              )}

              {/* BOTÃO FINALIZAR: Aparece apenas durante o treino e some ao abrir o feedback */}
              {workout.status === 'EM_ANDAMENTO' && !showFeedbackForm && (
                <button
                  onClick={() => setShowFeedbackForm(true)}
                  className="mt-8 w-full py-4 border border-red-500/50 hover:bg-red-500/10 text-red-500 text-[11px] font-black uppercase tracking-[0.2em] rounded-2xl transition-all"
                >
                  Finalizar Treino
                </button>
              )}
            </div>

            {/* CONTAINER DE FEEDBACKS: Visível apenas após clicar em finalizar ou se já estiver concluído */}
            {(showFeedbackForm || workout.status === 'CONCLUIDO') && (
              <div className="bg-white/[0.03] backdrop-blur-3xl rounded-[48px] p-12 border border-white/[0.06] shadow-2xl space-y-16 relative animate-in fade-in zoom-in-95 duration-500">
                {/* Linha vertical conectando os passos */}{' '}
                <div className="absolute left-[71px] top-28 bottom-28 w-[1px] bg-gradient-to-b from-purple-500/40 via-pink-500/40 to-transparent"></div>
                {/* PASSO 1: IMEDIATO (PSE) */}{' '}
                <FeedbackStep
                  step="1"
                  title="Imediato (PSE)"
                  data={
                    workout?.statusPSE ? { status: workout.statusPSE } : null
                  }
                  options={['Muito leve', 'Moderado', 'Forte', 'Muito forte']}
                  onSelect={(val) => {
                    handleFeedback('immediate', val);
                    setShowFeedbackForm(false);
                  }}
                  active={true}
                  color="purple"
                />
                {/* PASSO 2: PRÓXIMO DIA (PSR) */}
                {/* O step mudou para "2" pois removemos o de 4h */}{' '}
                <FeedbackStep
                  step="2"
                  title="Próximo Dia (PSR)"
                  data={
                    workout?.status24h ? { status: workout.status24h } : null
                  }
                  options={[
                    'Muito cansado',
                    'Recuperado',
                    'Pronto pra próxima',
                  ]}
                  onSelect={(val) => handleFeedback('next_day', val)}
                  active={podeResponder24h()} // Valida se passou 24h do término do treino
                  color="purple"
                />{' '}
                {workout?.status === 'CONCLUIDO' &&
                  !workout?.status24h &&
                  diferencaHoras() < 24 && (
                    <div className="pl-20 -mt-4 animate-pulse">
                      {' '}
                      <p className="text-[9px] text-purple-400/50 uppercase tracking-widest font-bold">
                        ● Disponível em
                        {Math.max(0, 24 - diferencaHoras()).toFixed(1)}h{' '}
                      </p>{' '}
                    </div>
                  )}{' '}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// --- SUB-COMPONENTES ---

function FeedbackStep({ step, title, data, options, onSelect, active, color }) {
  const isPink = color === 'pink';
  return (
    <div
      className={`flex items-start gap-8 relative z-10 transition-all duration-700 ${!active ? 'opacity-10 pointer-events-none grayscale' : 'opacity-100'}`}
    >
      <div
        className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-[13px] font-bold transition-all duration-500 shadow-2xl ${data ? (isPink ? 'bg-pink-500 text-white shadow-pink-500/20' : 'bg-purple-500 text-white shadow-purple-500/20') : 'bg-[#0A0A0C] border border-white/10 text-white/20'}`}
      >
        {data ? (
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={3}
              d="M5 13l4 4L19 7"
            />
          </svg>
        ) : (
          step
        )}
      </div>
      <div className="flex-1 pt-3">
        <h3
          className={`text-[12px] uppercase tracking-[0.25em] font-medium mb-5 ${data ? 'text-white/90' : 'text-white/40'}`}
        >
          {title}
        </h3>
        {data ? (
          <div
            className={`inline-flex px-5 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider ${isPink ? 'bg-pink-500/10 text-pink-400 border border-pink-500/20' : 'bg-purple-500/10 text-purple-400 border border-purple-500/20'}`}
          >
            {data.status}
          </div>
        ) : (
          <div className="flex flex-wrap gap-3">
            {options.map((opt) => (
              <button
                key={opt}
                onClick={() => onSelect(opt)}
                className={`text-[10px] font-bold px-5 py-2.5 rounded-xl border transition-all uppercase tracking-widest ${isPink ? 'border-pink-500/20 bg-white/5 text-pink-400/80 hover:bg-pink-500 hover:text-white' : 'border-purple-500/20 bg-white/5 text-purple-400/80 hover:bg-purple-500 hover:text-white'}`}
              >
                {opt}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ProfessorDashboard({
  user,
  report,
  setReport,
  fetchReport,
  onLogout,
}) {
  const [alunos, setAlunos] = useState([]);
  const [alunoId, setAlunoId] = useState('');
  const [abrirModalAjuste, setAbrirModalAjuste] = useState(false);
  const [sugestaoIA, setSugestaoIA] = useState(null);

  const getHojeAjustado = () => {
    const day = new Date().getDay();
    return day === 0 ? 6 : day - 1;
  };

  const [diaSelecionado, setDiaSelecionado] = useState(getHojeAjustado());

  const fetchSugestao = async (id) => {
    try {
      const token = localStorage.getItem('token');

      const res = await axios.get(`http://localhost:3001/sugerir-carga/${id}`, {
        headers: {
          Authorization: token,
        },
      });

      setSugestaoIA(res.data);
    } catch (err) {
      console.warn('IA: Sem dados de treino concluído para este aluno.');
      setSugestaoIA(null);
    }
    // ANTES TOKEN
    // try {
    //   const res = await axios.get(`http://localhost:3001/sugerir-carga/${id}`);
    //   setSugestaoIA(res.data);
    // } catch (err) {
    //   console.warn('IA: Sem dados de treino concluído para este aluno.');
    //   setSugestaoIA(null);
    // }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');

    axios
      .get('http://localhost:3001/usuarios', {
        headers: {
          Authorization: token,
        },
      })
      .then((res) => {
        setAlunos(res.data.filter((u) => u.role === 'ALUNO'));
      });
    //ANTES TOKEN
    // axios.get('http://localhost:3001/usuarios').then((res) => {
    //   setAlunos(res.data.filter((u) => u.role === 'ALUNO'));
    // });
  }, []);

  const handleSelect = (id) => {
    setReport(null);
    setSugestaoIA(null);

    setAlunoId(id);
    fetchReport(id);
    fetchSugestao(id);
  };

  const dadosDoDia =
    report?.historicoDetalhado && report.historicoDetalhado[diaSelecionado]
      ? {
          // 1. PSR: Pega a nota de recuperação específica salva naquele dia (Ex: 10 no domingo, 5 hoje)
          psr: Number(report.historicoDetalhado[diaSelecionado].psr || 0),

          // 2. STATUS: Pega o status24h real do banco para aquele dia
          status:
            report.historicoDetalhado[diaSelecionado].statusGeral || 'Estável',

          // 3. DIVERGÊNCIA: Pega o cálculo que o servidor fez para aquele treino específico
          divergenciaCarga:
            report.historicoDetalhado[diaSelecionado].divergenciaCarga || '0%',

          // 4. RECUPERAÇÃO: Cálculo dinâmico usando o PSE e PSR exclusivos do dia selecionado
          horasDor:
            report.historicoDetalhado[diaSelecionado].psr > 0
              ? Math.round(
                  (Number(report.historicoDetalhado[diaSelecionado].pse || 0) /
                    Number(report.historicoDetalhado[diaSelecionado].psr)) *
                    18,
                )
              : 0,

          // 5. PSE: Valor da barra do gráfico
          pse: Number(report.historicoDetalhado[diaSelecionado].pse || 0),

          // 6. DURAÇÃO: Adicione esta linha para capturar o tempo do treino
          duracaoMinutos:
            report.historicoDetalhado[diaSelecionado].duracaoMinutos || 0,
        }
      : {
          psr: 0,
          status: 'Sem dados',
          divergenciaCarga: '0%',
          horasDor: 0,
          pse: 0,
          duracaoMinutos: 0,
        };

  const sugerirAjuste = () => {
    const pse = dadosDoDia.pse;
    const psr = dadosDoDia.psr;
    const duracao = dadosDoDia.duracaoMinutos;

    if (duracao === 0 && pse === 0) {
      return {
        texto: 'Nenhuma atividade registrada para este dia.',
        cor: 'text-gray-500',
        bg: 'bg-white/5',
      };
    }

    if (pse >= 8 && psr <= 5) {
      return {
        texto: 'Reduzir volume para evitar fadiga excessiva.',
        cor: 'text-red-400',
        bg: 'bg-red-500/10',
      };
    }

    if (pse <= 5 && psr >= 8) {
      return {
        texto: 'Aumentar intensidade: Aluno pronto para novos pesos.',
        cor: 'text-green-400',
        bg: 'bg-green-500/10',
      };
    }

    return {
      texto: 'Manter: Treino em zona de desenvolvimento ideal.',
      cor: 'text-white/60',
      bg: 'bg-white/5',
    };
  };

  const handleGerarTreino = async (acao, dadosAjuste = null) => {
    try {
      const token = localStorage.getItem('token');

      const payload = {
        usuarioId: alunoId,
        acao: acao,
        ...dadosAjuste,
      };

      console.log('Enviando Payload para o Backend:', payload);

      await axios.post('http://localhost:3001/treinos', payload, {
        headers: {
          Authorization: token,
        },
      });

      alert(
        acao === 'MANTER'
          ? 'Treino replicado com sucesso!'
          : 'Novo treino gerado!',
      );

      //ANTES TOKEN
      // await axios.post('http://localhost:3001/treinos', payload);
      // alert(
      //   acao === 'MANTER'
      //     ? 'Treino replicado com sucesso!'
      //     : 'Novo treino gerado!',
      // );

      fetchReport(alunoId);
    } catch (error) {
      console.error('Erro ao gerar treino:', error);
      alert('Falha ao gerar novo treino.');
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0C] text-white p-6 font-sans antialiased">
      <div className="max-w-5xl mx-auto">
        <header className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-2xl font-light tracking-[0.5em] uppercase text-white/90">
              Gym<span className="font-bold text-purple-500">Flow</span>
            </h1>
            <p className="text-gray-500 text-[10px] uppercase tracking-[0.3em] mt-2">
              Performance Insight •{' '}
              {alunos.find((a) => a.id === alunoId)?.nome ||
                'Selecione o Aluno'}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <select
              className="bg-[#16161D] border border-white/5 p-2.5 rounded-xl text-[11px] text-gray-300 outline-none focus:border-purple-500 transition-all"
              onChange={(e) => handleSelect(e.target.value)}
            >
              <option value="">Selecionar Aluno</option>
              {alunos.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.nome}
                </option>
              ))}
            </select>
            <button
              onClick={onLogout}
              className="text-[10px] text-white/20 font-bold uppercase hover:text-white transition-colors"
            >
              Sair
            </button>
          </div>
        </header>

        {report && alunoId ? (
          <div className="flex flex-col gap-6">
            {!report.cicloCompleto && (
              <div className="mb-2 py-3 px-5 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl">
                <p className="text-[10px] text-yellow-500 uppercase font-bold tracking-[0.2em] animate-pulse flex items-center gap-2">
                  <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                  Ciclo de recuperação em andamento (Aguardando PSR 24h)
                </p>
              </div>
            )}

            <div className="bg-[#16161D] p-8 rounded-[32px] border border-white/5">
              <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-10">
                Variabilidade Semanal (Esforço PSE)
              </h3>
              <div className="flex justify-between items-end h-56 gap-3">
                {['SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SAB', 'DOM'].map(
                  (dia, i) => {
                    const isSelected = diaSelecionado === i;

                    const valorPse = report?.variabilidadeSemanal
                      ? report.variabilidadeSemanal[i]
                      : null;

                    const alturaBarra =
                      valorPse === null ? 0 : valorPse * 10 || 5;

                    return (
                      <button
                        key={i}
                        onClick={() => setDiaSelecionado(i)}
                        className="flex flex-col items-center flex-1 group"
                      >
                        <div className="relative w-full flex justify-center items-end h-40">
                          {valorPse !== null && (
                            <span
                              className={`absolute transition-all duration-300 ${
                                isSelected
                                  ? '-top-10 text-purple-400 scale-125'
                                  : '-top-7 text-gray-600'
                              } text-[11px] font-bold`}
                            >
                              {valorPse}
                            </span>
                          )}
                          <div
                            className={`w-full max-w-[32px] rounded-t-xl transition-all duration-700 ease-out ${
                              isSelected
                                ? 'bg-gradient-to-t from-purple-900 to-purple-500 shadow-[0_0_30px_rgba(168,85,247,0.5)]'
                                : 'bg-white/5 group-hover:bg-white/10'
                            }`}
                            style={{
                              height: `${alturaBarra}%`,
                              minHeight: valorPse !== null ? '4px' : '0',
                            }}
                          ></div>
                        </div>
                        <span
                          className={`text-[10px] mt-4 font-bold tracking-tighter ${isSelected ? 'text-white' : 'text-gray-600'}`}
                        >
                          {dia}
                        </span>
                      </button>
                    );
                  },
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCardContainer
                label="Percepção de Recuperção (PSR)"
                value={dadosDoDia.psr}
                total="/ 10"
                progress={dadosDoDia.psr * 10}
                footer={dadosDoDia.status}
              />
              <StatCardContainer
                label="Intensidade do Treino"
                value={dadosDoDia.divergenciaCarga}
                progress={Math.abs(parseInt(dadosDoDia.divergenciaCarga)) || 0}
                footer={
                  dadosDoDia.duracaoMinutos > 0
                    ? `Duração: ${dadosDoDia.duracaoMinutos} min • Diferença planejada`
                    : 'Diferença do esforço planejado'
                }
              />
              <StatCardContainer
                label="Recuperação"
                value={`${dadosDoDia.horasDor}h`}
                progress={Math.min((dadosDoDia.horasDor / 48) * 100, 100)}
                footer={
                  // Caso 1: Houve treino e a recuperação foi zerada (Dado Real)
                  dadosDoDia.horasDor === 0 && dadosDoDia.psr > 0
                    ? 'Recuperação imediata detectada'
                    : // Caso 2: Não houve treino nem resposta ainda (Estado Vazio)
                      dadosDoDia.duracaoMinutos === 0
                      ? 'Aguardando atividade'
                      : // Caso 3: Cálculo padrão em andamento
                        'Tempo estimado via PSE + PSR'
                }
              />
            </div>

            <div
              className={`mt-6 p-5 rounded-[24px] border border-white/10 ${sugerirAjuste().bg} backdrop-blur-md transition-all duration-500`}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`mt-1 w-2 h-2 rounded-full animate-pulse ${sugerirAjuste().cor.replace('text', 'bg')}`}
                ></div>
                <div className="flex-1">
                  <h4 className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold mb-2">
                    Análise de Carga
                  </h4>
                  <p className="text-sm text-white font-medium leading-relaxed">
                    {sugerirAjuste().texto}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-3">
              {/* BOTÃO 1: AJUSTAR TREINO (Ação Técnica/Pontual) */}
              {/* Focado em abrir o modal para mudar a carga sem necessariamente criar uma nova sessão agora */}
              <button
                onClick={() => setAbrirModalAjuste(true)}
                className="w-full py-4 bg-white text-black text-[10px] uppercase tracking-[0.2em] font-black rounded-2xl hover:bg-purple-600 hover:text-white transition-all shadow-xl"
              >
                Ajustar Treino
              </button>

              {/* BOTÃO 2: GERAR NOVO TREINO (Ação de Fluxo/Continuidade) */}
              {/* Focado em replicar exatamente o que já existe para a próxima vez do aluno */}
              <button
                onClick={() => handleGerarTreino('MANTER')}
                className="w-full py-4 border border-white/10 bg-white/5 text-white/60 text-[10px] uppercase tracking-[0.2em] font-bold rounded-2xl hover:bg-white/10 hover:text-white transition-all"
              >
                Gerar Novo Treino (Replicar Atual)
              </button>
            </div>

            {abrirModalAjuste && (
              <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className="bg-[#16161D] border border-white/10 p-8 rounded-[32px] max-w-md w-full shadow-2xl">
                  <h3 className="text-xl font-bold text-white mb-2 italic">
                    Ajuste Inteligente
                  </h3>

                  {sugestaoIA && sugestaoIA.detalhes ? (
                    <>
                      {/* Cabeçalho de Insight Global */}
                      <div className="bg-purple-500/10 border border-purple-500/20 rounded-2xl p-4 mb-6">
                        <p className="text-[10px] uppercase tracking-widest text-purple-400 font-bold mb-1">
                          Sugestão do Performance Insight
                        </p>
                        <p className="text-white text-sm leading-relaxed">
                          {sugestaoIA.recomendacao}
                        </p>
                      </div>

                      {/* Lista de Equipamentos para Ajuste */}
                      <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                        {sugestaoIA.detalhes.map((item, index) => (
                          <div
                            key={index}
                            className="border-b border-white/5 pb-4 last:border-0"
                          >
                            <div className="flex justify-between items-end mb-3">
                              <div>
                                <p className="text-white font-bold text-sm">
                                  {item.nome}
                                </p>
                                <p className="text-white/40 text-[10px] uppercase">
                                  {item.musculo}
                                </p>
                              </div>
                              <div className="text-right">
                                <span className="text-[10px] text-white/30 block uppercase font-bold">
                                  Ajuste
                                </span>
                                <span
                                  className={`text-xs font-bold ${item.cargaNova > item.cargaAnterior ? 'text-green-400' : 'text-red-400'}`}
                                >
                                  {item.ajusteTexto}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-3">
                              <div className="flex-1">
                                <label className="text-[9px] uppercase text-white/30 font-bold mb-1 block">
                                  Anterior
                                </label>
                                <div className="bg-white/5 p-3 rounded-xl text-white/60 text-xs">
                                  {item.cargaAnterior}kg
                                </div>
                              </div>

                              <div className="flex-[2]">
                                <label className="text-[9px] uppercase text-purple-400 font-bold mb-1 block">
                                  Sugerido (kg)
                                </label>
                                <input
                                  type="number"
                                  id={`input-carga-${item.nome}`}
                                  defaultValue={
                                    Math.round(
                                      Number(item.cargaNova || 0) / 5,
                                    ) * 5
                                  }
                                  className="w-full bg-[#0A0A0C] border border-white/10 p-3 rounded-xl text-white text-sm outline-none focus:border-purple-500 transition-all"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Botões de Ação */}
                      <div className="flex gap-3 pt-6 border-t border-white/10 mt-4">
                        <button
                          onClick={() => setAbrirModalAjuste(false)}
                          className="flex-1 text-white/40 font-bold uppercase text-[10px] hover:text-white transition-colors"
                        >
                          Cancelar
                        </button>
                        <button
                          className="flex-1 py-4 bg-purple-600 text-white font-bold rounded-2xl uppercase text-[10px] shadow-lg shadow-purple-500/20 hover:bg-purple-500 transition-all active:scale-95"
                          onClick={() => {
                            const equipamentosParaNovoTreino =
                              sugestaoIA.detalhes
                                .map((item) => {
                                  const valorInput = document.getElementById(
                                    `input-carga-${item.nome}`,
                                  )?.value;

                                  // Se o professor editou o input, usamos o valor dele; se não, usamos a cargaNova da IA
                                  const cargaParaProcessar = Number(
                                    valorInput || item.cargaNova,
                                  );

                                  const idOriginal =
                                    item.equipamentoId ||
                                    item.id ||
                                    item.equipamento?.id;

                                  return {
                                    id: idOriginal,
                                    // Aplicamos o arredondamento de 5kg para garantir pesos reais de academia
                                    carga:
                                      Math.round(cargaParaProcessar / 5) * 5,
                                  };
                                })
                                .filter((item) => item.id !== undefined);

                            // 2. Trava de segurança (QA): Se não houver IDs, não disparamos o backend
                            if (equipamentosParaNovoTreino.length === 0) {
                              console.error(
                                'Erro de QA: IDs ausentes no mapeamento.',
                              );
                              alert(
                                'Falha técnica: Não foi possível identificar os equipamentos.',
                              );
                              return;
                            }

                            // 3. Disparamos a criação com o payload sanitizado
                            handleGerarTreino('AJUSTAR', {
                              usuarioId: alunoId,
                              exercise: 'Treino Sugerido pela IA',
                              prescribed_intensity:
                                'Ajustada via Performance Insight',
                              equipamentosSelecionados:
                                equipamentosParaNovoTreino,
                              acao: 'AJUSTAR',
                            });

                            // 4. Feedback visual imediato
                            setAbrirModalAjuste(false);
                          }}
                        >
                          Confirmar e Gerar
                        </button>
                      </div>
                    </>
                  ) : (
                    /* CONTEÚDO QUANDO NÃO HÁ DADOS AINDA */
                    <div className="py-8 text-center">
                      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
                        <p className="text-gray-400 text-xs uppercase tracking-widest leading-relaxed">
                          Ainda não existem treinos concluídos ou feedbacks de
                          24h para este aluno.
                          <br />
                          <br />
                          <span className="text-purple-400/60">
                            Aguardando processamento de dados para gerar
                            sugestão de carga.
                          </span>
                        </p>
                      </div>
                      <button
                        onClick={() => setAbrirModalAjuste(false)}
                        className="w-full py-4 border border-white/10 text-white/40 font-bold uppercase text-[10px] rounded-2xl hover:text-white transition-colors"
                      >
                        Voltar ao Dashboard
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="mt-20 text-center text-gray-800 italic tracking-widest uppercase text-xs">
            Aguardando seleção de aluno para análise...
          </div>
        )}
      </div>
    </div>
  );
}

function StatCardContainer({ label, value, total, progress, footer }) {
  return (
    <div className="bg-[#16161D] p-10 rounded-[40px] border border-gray-800 shadow-2xl">
      <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-6">
        {label}
      </p>
      <div className="flex items-baseline gap-2 mb-6">
        <span className="text-6xl font-black text-white">{value}</span>
        <span className="text-gray-600 text-xl">{total}</span>
      </div>
      <div className="w-full bg-gray-900 h-2.5 rounded-full mb-6 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-purple-600 to-pink-500"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      <span className="text-[10px] font-bold text-white/40 uppercase tracking-tight">
        ● {footer}
      </span>
    </div>
  );
}

function LoginScreen({ email, setEmail, senha, setSenha, handleLogin }) {
  return (
    <div className="min-h-screen bg-[#0A0A0C] flex items-center justify-center p-6 font-sans">
      <form
        onSubmit={handleLogin}
        className="bg-[#16161D] p-8 rounded-[32px] border border-gray-800 w-full max-w-sm shadow-2xl"
      >
        <h1 className="text-2xl font-light tracking-[0.5em] uppercase text-white/90">
          Gym<span className="font-bold text-purple-500">Flow</span>
        </h1>
        <div className="space-y-4">
          <input
            type="email"
            placeholder="E-mail"
            value={email}
            className="w-full bg-[#0A0A0C] border border-gray-700 rounded-xl p-3 text-white outline-none focus:border-purple-500"
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Senha"
            value={senha}
            className="w-full bg-[#0A0A0C] border border-gray-700 rounded-xl p-3 text-white outline-none focus:border-purple-500"
            onChange={(e) => setSenha(e.target.value)}
            required
          />
          <button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 p-3 rounded-xl font-bold text-white">
            Entrar
          </button>
        </div>
      </form>
    </div>
  );
}

export default App;
