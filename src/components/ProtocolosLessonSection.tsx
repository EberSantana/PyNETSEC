import { useState } from 'react';
import {
  ArrowLeftRight,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Code2,
  Cpu,
  Layers,
  Lock,
  Network,
  Scale,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import {
  PROTOCOL_LESSON,
  ProtocolosLessonContent,
  ProtocolProfile,
} from '../data/lessons/protocolos';
import { getMissionById } from '../data/missions';
import { Mission } from '../types/ctf';

interface ProtocolosLessonSectionProps {
  lesson?: ProtocolosLessonContent;
  isMissionUnlocked: (mission: Mission) => boolean;
  onGoToMission: (mission: Mission) => void;
  onPracticePythonDrills: () => void;
  onOpenNetworkSimulator: () => void;
}

type LessonTab = 'mechanics' | 'comparison' | 'use-cases';

export function ProtocolosLessonSection({
  lesson = PROTOCOL_LESSON,
  isMissionUnlocked,
  onGoToMission,
  onPracticePythonDrills,
  onOpenNetworkSimulator,
}: ProtocolosLessonSectionProps) {
  const [activeTab, setActiveTab] = useState<LessonTab>('mechanics');
  const [focusedProto, setFocusedProto] = useState<'tcp' | 'udp'>('tcp');
  const [useCaseFilter, setUseCaseFilter] = useState<'ALL' | 'TCP' | 'UDP'>('ALL');

  const profile: ProtocolProfile =
    focusedProto === 'tcp' ? lesson.tcp : lesson.udp;

  const filteredUseCases = lesson.useCases.filter((uc) =>
    useCaseFilter === 'ALL' ? true : uc.protocol === useCaseFilter
  );

  const highlightItems = [
    lesson.highlights.reliability,
    lesson.highlights.handshake,
    lesson.highlights.headerSize,
    lesson.highlights.streamingVsFileTransfer,
  ];

  return (
    <div className="space-y-6">
      {/* Top Overview Card */}
      <section className="rounded-2xl border border-slate-800 bg-[#0F1E36] p-6">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
              <span className="inline-flex items-center gap-1.5 font-semibold text-cyan-300">
                <Layers className="h-3.5 w-3.5" />
                {lesson.osiLayer}
              </span>
              <span className="text-slate-600">·</span>
              <span className="tabular-nums">
                {lesson.readTimeMinutes} min de leitura
              </span>
            </div>

            <h2 className="mt-2 text-2xl font-bold text-slate-50">
              {lesson.title}
            </h2>
            <p className="mt-1 text-sm text-slate-400">{lesson.subtitle}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onPracticePythonDrills}
              className="flex cursor-pointer items-center gap-1.5 rounded-lg bg-cyan-400 px-3.5 py-2 text-xs font-semibold text-[#05131C] transition-colors hover:bg-cyan-300 whitespace-nowrap"
            >
              <Code2 className="h-3.5 w-3.5" />
              Treinar TCP/UDP em Python
            </button>
            <button
              type="button"
              onClick={onOpenNetworkSimulator}
              className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-700 bg-[#071225] px-3.5 py-2 text-xs font-semibold text-slate-200 transition-colors hover:border-cyan-400/50 hover:text-cyan-200 whitespace-nowrap"
            >
              <Network className="h-3.5 w-3.5 text-cyan-300" />
              Simulador & Portas IANA
            </button>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-3">
          {lesson.overviewParagraphs.map((paragraph, idx) => (
            <div
              key={idx}
              className="rounded-xl border border-slate-800/90 bg-[#071225] p-4 text-xs leading-relaxed text-slate-300"
            >
              {paragraph}
            </div>
          ))}
        </div>

        {/* 4 Core Pillars: Reliability, Handshake, Header Size, Streaming vs File Transfer */}
        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {highlightItems.map((item) => (
            <div
              key={item.label}
              className="rounded-xl border border-slate-800 bg-[#071225] p-4 text-xs"
            >
              <p className="font-semibold text-slate-100">{item.label}</p>
              <p className="mt-2 leading-relaxed text-slate-300">
                <span className="font-mono font-semibold text-cyan-300">TCP: </span>
                {item.tcp}
              </p>
              <p className="mt-1.5 leading-relaxed text-slate-300">
                <span className="font-mono font-semibold text-amber-300">UDP: </span>
                {item.udp}
              </p>
            </div>
          ))}
        </div>

        {/* Side-by-side Protocol Summary Cards */}
        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* TCP Card */}
          <div className="rounded-xl border border-cyan-500/30 bg-[#071225] p-5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-cyan-300" />
                <div>
                  <h3 className="text-base font-bold text-slate-50">
                    {lesson.tcp.acronym}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {lesson.tcp.fullName}
                  </p>
                </div>
              </div>
              <span className="font-mono text-[11px] font-semibold text-cyan-200 whitespace-nowrap">
                {lesson.tcp.rfc}
              </span>
            </div>

            <p className="mt-3 text-xs leading-relaxed text-slate-300">
              {lesson.tcp.summary}
            </p>

            <div className="mt-3.5 grid grid-cols-2 gap-2.5 text-xs">
              <div className="rounded-lg border border-slate-800 bg-[#0F1E36] px-3 py-2">
                <span className="block text-[11px] text-slate-400">Cabeçalho</span>
                <span className="font-mono font-semibold text-cyan-300 tabular-nums">
                  {lesson.tcp.headerSize}
                </span>
              </div>
              <div className="rounded-lg border border-slate-800 bg-[#0F1E36] px-3 py-2">
                <span className="block text-[11px] text-slate-400">Socket Python</span>
                <span className="font-mono font-semibold text-cyan-300">
                  {lesson.tcp.pythonSocket}
                </span>
              </div>
            </div>

            <p className="mt-3 rounded-lg border border-slate-800/80 bg-[#0D1322] px-3 py-2 text-xs text-slate-300">
              <span className="font-semibold text-cyan-200">Analogia: </span>
              {lesson.tcp.analogy}
            </p>
          </div>

          {/* UDP Card */}
          <div className="rounded-xl border border-amber-500/30 bg-[#071225] p-5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-amber-300" />
                <div>
                  <h3 className="text-base font-bold text-slate-50">
                    {lesson.udp.acronym}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {lesson.udp.fullName}
                  </p>
                </div>
              </div>
              <span className="font-mono text-[11px] font-semibold text-amber-200 whitespace-nowrap">
                {lesson.udp.rfc}
              </span>
            </div>

            <p className="mt-3 text-xs leading-relaxed text-slate-300">
              {lesson.udp.summary}
            </p>

            <div className="mt-3.5 grid grid-cols-2 gap-2.5 text-xs">
              <div className="rounded-lg border border-slate-800 bg-[#0F1E36] px-3 py-2">
                <span className="block text-[11px] text-slate-400">Cabeçalho</span>
                <span className="font-mono font-semibold text-amber-300 tabular-nums">
                  {lesson.udp.headerSize}
                </span>
              </div>
              <div className="rounded-lg border border-slate-800 bg-[#0F1E36] px-3 py-2">
                <span className="block text-[11px] text-slate-400">Socket Python</span>
                <span className="font-mono font-semibold text-amber-300">
                  {lesson.udp.pythonSocket}
                </span>
              </div>
            </div>

            <p className="mt-3 rounded-lg border border-slate-800/80 bg-[#0D1322] px-3 py-2 text-xs text-slate-300">
              <span className="font-semibold text-amber-200">Analogia: </span>
              {lesson.udp.analogy}
            </p>
          </div>
        </div>
      </section>

      {/* Interactive Deep-Dive Tabs */}
      <section className="rounded-2xl border border-slate-800 bg-[#0F1E36] p-6">
        <div className="flex flex-col justify-between gap-3 border-b border-slate-800 pb-4 sm:flex-row sm:items-center">
          <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-slate-800 bg-[#071225] p-1">
            <button
              type="button"
              onClick={() => setActiveTab('mechanics')}
              className={`flex cursor-pointer items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors whitespace-nowrap ${
                activeTab === 'mechanics'
                  ? 'bg-cyan-400 text-[#05131C]'
                  : 'text-slate-300 hover:text-slate-100'
              }`}
            >
              <Cpu className="h-3.5 w-3.5" />
              Funcionamento & Cabeçalho
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('comparison')}
              className={`flex cursor-pointer items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors whitespace-nowrap ${
                activeTab === 'comparison'
                  ? 'bg-cyan-400 text-[#05131C]'
                  : 'text-slate-300 hover:text-slate-100'
              }`}
            >
              <Scale className="h-3.5 w-3.5" />
              Comparativo TCP × UDP
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('use-cases')}
              className={`flex cursor-pointer items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors whitespace-nowrap ${
                activeTab === 'use-cases'
                  ? 'bg-cyan-400 text-[#05131C]'
                  : 'text-slate-300 hover:text-slate-100'
              }`}
            >
              <BookOpen className="h-3.5 w-3.5" />
              Casos de Uso Reais ({lesson.useCases.length})
            </button>
          </div>

          {activeTab === 'mechanics' && (
            <div className="flex items-center gap-1 rounded-lg border border-slate-800 bg-[#071225] p-1 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setFocusedProto('tcp')}
                className={`cursor-pointer rounded-md px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap ${
                  focusedProto === 'tcp'
                    ? 'bg-cyan-400/20 text-cyan-200 border border-cyan-400/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Inspecionar TCP
              </button>
              <button
                type="button"
                onClick={() => setFocusedProto('udp')}
                className={`cursor-pointer rounded-md px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap ${
                  focusedProto === 'udp'
                    ? 'bg-amber-400/20 text-amber-200 border border-amber-400/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Inspecionar UDP
              </button>
            </div>
          )}

          {activeTab === 'use-cases' && (
            <div className="flex items-center gap-1 rounded-lg border border-slate-800 bg-[#071225] p-1 self-start sm:self-auto">
              {(['ALL', 'TCP', 'UDP'] as const).map((filterVal) => (
                <button
                  key={filterVal}
                  type="button"
                  onClick={() => setUseCaseFilter(filterVal)}
                  className={`cursor-pointer rounded-md px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap ${
                    useCaseFilter === filterVal
                      ? 'bg-cyan-400 text-[#05131C]'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {filterVal === 'ALL' ? 'Todos' : filterVal}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* TAB 1: MECHANICS & HEADER */}
        {activeTab === 'mechanics' && (
          <div className="mt-5 grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* Step-by-step lifecycle */}
            <div className="space-y-4 lg:col-span-6">
              <div>
                <h3 className="text-sm font-bold text-slate-100">
                  Fluxo de Funcionamento do {profile.acronym}
                </h3>
                <p className="mt-0.5 text-xs text-slate-400">{profile.tagline}</p>
              </div>

              <div className="space-y-2.5">
                {profile.howItWorks.map((step) => (
                  <div
                    key={step.step}
                    className="rounded-xl border border-slate-800 bg-[#071225] p-3.5"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-mono text-xs font-bold tabular-nums ${
                            profile.id === 'tcp' ? 'text-cyan-300' : 'text-amber-300'
                          }`}
                        >
                          {step.step}
                        </span>
                        <span className="text-xs font-bold text-slate-100">
                          {step.label}
                        </span>
                      </div>

                      {step.direction && (
                        <span className="inline-flex items-center gap-1 rounded-md border border-slate-800 bg-[#0F1E36] px-2 py-0.5 font-mono text-[10px] text-slate-400 whitespace-nowrap">
                          <ArrowLeftRight className="h-3 w-3" />
                          {step.direction === 'client-to-server'
                            ? 'Cliente → Servidor'
                            : step.direction === 'server-to-client'
                              ? 'Servidor → Cliente'
                              : 'Bidirecional'}
                        </span>
                      )}
                    </div>
                    <p className="mt-1.5 text-xs leading-relaxed text-slate-300">
                      {step.detail}
                    </p>
                  </div>
                ))}
              </div>

              {/* Strengths & Trade-offs */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-emerald-500/25 bg-[#071225] p-4">
                  <h4 className="text-xs font-bold text-emerald-300">Pontos Fortes</h4>
                  <ul className="mt-2 space-y-1.5 text-xs text-slate-300">
                    {profile.strengths.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-xl border border-amber-500/25 bg-[#071225] p-4">
                  <h4 className="text-xs font-bold text-amber-300">Limitações / Custos</h4>
                  <ul className="mt-2 space-y-1.5 text-xs text-slate-300">
                    {profile.tradeoffs.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-300" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Header Anatomy + Core Mechanisms */}
            <div className="space-y-4 lg:col-span-6">
              <div>
                <h3 className="text-sm font-bold text-slate-100">
                  Anatomia do Cabeçalho {profile.acronym} ({profile.headerSize})
                </h3>
                <p className="mt-0.5 text-xs text-slate-400">
                  Campos adicionados pela Camada 4 antes de entregar o pacote ao protocolo IP.
                </p>
              </div>

              <div className="overflow-hidden rounded-xl border border-slate-800 bg-[#071225]">
                <div className="divide-y divide-slate-800/80">
                  {profile.headerFields.map((hf, idx) => (
                    <div key={idx} className="p-3.5">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span
                          className={`font-mono text-xs font-semibold ${
                            profile.id === 'tcp' ? 'text-cyan-300' : 'text-amber-300'
                          }`}
                        >
                          {hf.field}
                        </span>
                        <span className="rounded bg-[#0F1E36] px-2 py-0.5 font-mono text-[11px] text-slate-300 tabular-nums">
                          {hf.size}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-slate-300">{hf.purpose}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2.5">
                <h4 className="text-xs font-bold text-slate-200">
                  Mecanismos Essenciais do {profile.acronym}
                </h4>
                {profile.keyFeatures.map((feat, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl border border-slate-800 bg-[#071225] p-3.5"
                  >
                    <p className="text-xs font-semibold text-slate-100">{feat.title}</p>
                    <p className="mt-1 text-xs leading-relaxed text-slate-400">
                      {feat.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: COMPARISON TABLE + GOLDEN RULES */}
        {activeTab === 'comparison' && (
          <div className="mt-5 space-y-5">
            <div className="overflow-x-auto rounded-xl border border-slate-800 bg-[#071225]">
              <table className="w-full min-w-[680px] text-left text-xs">
                <thead className="border-b border-slate-800 bg-[#0D1322] text-slate-400">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Critério Técnico</th>
                    <th className="px-4 py-3 font-semibold text-cyan-300">
                      TCP (Confiabilidade)
                    </th>
                    <th className="px-4 py-3 font-semibold text-amber-300">
                      UDP (Velocidade)
                    </th>
                    <th className="px-4 py-3 font-semibold">Impacto Prático</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/70">
                  {lesson.comparisonRows.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-900/40">
                      <td className="px-4 py-3 font-semibold text-slate-100">
                        {row.criterion}
                      </td>
                      <td className="px-4 py-3 text-slate-200">{row.tcp}</td>
                      <td className="px-4 py-3 text-slate-200">{row.udp}</td>
                      <td className="px-4 py-3 text-slate-400">{row.practicalImpact}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Golden Rules */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {lesson.goldenRules.map((rule) => (
                <div
                  key={rule.protocol}
                  className={`rounded-xl border p-4 bg-[#071225] ${
                    rule.protocol === 'TCP'
                      ? 'border-cyan-500/35'
                      : 'border-amber-500/35'
                  }`}
                >
                  <p
                    className={`text-xs font-bold ${
                      rule.protocol === 'TCP' ? 'text-cyan-300' : 'text-amber-300'
                    }`}
                  >
                    {rule.title}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-100">
                    {rule.question}
                  </p>
                  <p className="mt-1.5 text-xs leading-relaxed text-slate-300">
                    {rule.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: REAL-WORLD USE CASES */}
        {activeTab === 'use-cases' && (
          <div className="mt-5 grid grid-cols-1 gap-3.5 md:grid-cols-2 lg:grid-cols-3">
            {filteredUseCases.map((uc) => (
              <div
                key={uc.id}
                className="flex flex-col justify-between rounded-xl border border-slate-800 bg-[#071225] p-4"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`rounded-md px-2 py-0.5 font-mono text-[11px] font-bold ${
                        uc.protocol === 'TCP'
                          ? 'border border-cyan-400/35 bg-cyan-400/10 text-cyan-200'
                          : 'border border-amber-400/35 bg-amber-400/10 text-amber-200'
                      }`}
                    >
                      {uc.protocol}
                    </span>
                    <span className="font-mono text-[11px] text-slate-400 tabular-nums">
                      Porta {uc.ports}
                    </span>
                  </div>

                  <h4 className="mt-2.5 text-sm font-bold text-slate-100">
                    {uc.service}
                  </h4>
                  <p className="text-[11px] font-medium text-slate-500">{uc.category}</p>

                  <p className="mt-2 text-xs leading-relaxed text-slate-300">
                    {uc.scenario}
                  </p>
                </div>

                <div className="mt-3 border-t border-slate-800/80 pt-2.5 text-xs text-slate-400">
                  <span className="font-semibold text-slate-200">Por quê? </span>
                  {uc.whyItFits}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Linked Network Missions Strip */}
        <div className="mt-6 border-t border-slate-800 pt-5">
          <p className="text-xs font-medium text-slate-400">
            Pronto para aplicar TCP e UDP no CTF? Missões de redes ligadas a esta lição:
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {lesson.relatedMissionIds.map((mId) => {
              const mission = getMissionById(mId);
              const unlocked = isMissionUnlocked(mission);
              return (
                <button
                  key={mId}
                  type="button"
                  disabled={!unlocked}
                  onClick={() => onGoToMission(mission)}
                  className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-cyan-400/40 bg-cyan-400/10 px-3 py-2 text-xs font-semibold text-cyan-200 transition-colors hover:bg-cyan-400/20 disabled:cursor-not-allowed disabled:border-slate-800 disabled:bg-slate-900 disabled:text-slate-500"
                >
                  {!unlocked && <Lock className="h-3 w-3" />}
                  <span>
                    {mission.id}: {mission.title}
                  </span>
                  {unlocked && <ArrowRight className="h-3.5 w-3.5" />}
                </button>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
