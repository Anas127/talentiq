import { useState } from "react";
import { Upload, TrendingUp, Brain, Globe } from "lucide-react";

import { motion } from "framer-motion";
import { Link } from "react-router-dom";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

import { analyzeCV, simulate } from "../services/api";

export default function Analyzer() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const [result, setResult] = useState(null);
  const [trajectory, setTrajectory] = useState([]);

  const [error, setError] = useState("");

  // =========================
  // HANDLE UPLOAD
  // =========================

  const handleUpload = async () => {
    if (!file) {
      setError("Veuillez importer un CV PDF.");
      return;
    }

    try {
      setError("");
      setLoading(true);

      const res = await analyzeCV(file);

      setResult(res.data);
      localStorage.setItem("analysis_result", JSON.stringify(res.data));

      const sim = await simulate(res.data.used_for_prediction);

      setTrajectory(sim.data.trajectory);
      localStorage.setItem("trajectory", JSON.stringify(sim.data.trajectory));
    } catch (err) {
      console.error(err);
      setError("Échec de l’analyse du CV.");
    } finally {
      setLoading(false);
    }
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div
          className="
        bg-white/95
        backdrop-blur-xl
        border border-black/[0.05]
        rounded-2xl
        px-4 py-3
        shadow-xl
      "
        >
          <p
            className="
          text-[13px]
          text-black/45
          mb-1
        "
          >
            {label} ans d’expérience
          </p>

          <p
            className="
          text-[22px]
          font-semibold
          tracking-[-0.03em]
        "
          >
            ${Math.round(payload[0].value).toLocaleString()}
          </p>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-[#f6f6f3] text-[#111]">
      {/* NAVBAR */}

      <nav
        className="
        sticky top-0 z-50
        backdrop-blur-xl
        bg-white/70
        border-b border-black/[0.04]
      "
      >
        <div
          className="
          max-w-[1350px]
          mx-auto
          px-8
          py-5
          flex items-center justify-between
        "
        >
          <h1
            className="
            text-[30px]
            font-semibold
            tracking-[-0.03em]
          "
          >
            Quantiva AI
          </h1>

          <div
            className="
            flex items-center
            gap-10
            text-[15px]
            text-black/55
          "
          >
            <Link to="/" className="text-black font-medium">
              Analyseur
            </Link>

            <Link to="/insights" className="hover:text-black transition">
              Insights
            </Link>

            <button>Simulateur</button>
          </div>
        </div>
      </nav>

      {/* HERO */}

      <section
        className="
        max-w-[1350px]
        mx-auto
        px-8
        pt-10
      "
      >
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1
            className="
            text-[54px]
            font-semibold
            tracking-[-0.04em]
            leading-[1]
            max-w-4xl
          "
          >
            Analyseur Intelligent de Salaire
          </h1>

          <p
            className="
            text-black/55
            text-[18px]
            mt-5
            max-w-2xl
            leading-relaxed
          "
          >
            Importez votre CV pour une prédiction salariale alimentée par l’IA,
            une analyse du marché, une évaluation du profil et une projection de
            l’évolution salariale.
          </p>
        </motion.div>
      </section>

      {/* MAIN */}

      <section
        className="
        max-w-[1350px]
        mx-auto
        px-8
        py-6
      "
      >
        <div
          className="
          grid
          grid-cols-1
          lg:grid-cols-[320px_1fr]
          gap-6
        "
        >
          {/* LEFT PANEL */}

          <motion.div
            whileHover={{ y: -2 }}
            className="
              bg-white
              rounded-[30px]
              border border-black/[0.04]
              p-6
              shadow-[0_10px_30px_rgba(0,0,0,0.03)]
              h-fit
            "
          >
            <div
              className="
              border border-dashed border-black/[0.08]
              rounded-[24px]
              min-h-[340px]
              flex flex-col
              items-center justify-center
              text-center
              px-8 py-10
            "
            >
              {/* ICON */}

              <div
                className="
                w-16 h-16
                rounded-full
                bg-blue-50
                flex items-center justify-center
                mb-5
              "
              >
                <Upload
                  className="
                  w-7 h-7
                  text-blue-600
                "
                />
              </div>

              {/* TITLE */}

              <h2
                className="
                text-[36px]
                font-semibold
                tracking-[-0.04em]
                leading-none
              "
              >
                Importer un CV
              </h2>

              <p
                className="
                text-black/50
                text-[15px]
                mt-4
                leading-relaxed
                max-w-[280px]
              "
              >
                Importez un CV PDF pour une analyse salariale, une évaluation du
                profil et une intelligence du marché alimentée par l’IA.
              </p>

              {/* INPUT */}

              <input
                id="cv-upload"
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];

                  if (f) {
                    setFile(f);
                    setError("");
                  }
                }}
              />

              {/* BUTTON */}

              <label
                htmlFor="cv-upload"
                className="
                  mt-8
                  bg-black
                  text-white
                  px-6 py-3
                  rounded-2xl
                  cursor-pointer
                  hover:scale-[1.02]
                  active:scale-[0.98]
                  transition
                  text-[15px]
                  font-medium
                "
              >
                Choisir un CV
              </label>

              {/* FILE */}

              {file && (
                <div
                  className="
                  mt-5
                  text-[14px]
                  text-black/55
                  bg-black/[0.03]
                  px-4 py-2
                  rounded-xl
                  max-w-full
                  truncate
                "
                >
                  {file.name}
                </div>
              )}

              {/* ERROR */}

              {error && (
                <div
                  className="
                  mt-4
                  text-red-500
                  text-sm
                "
                >
                  {error}
                </div>
              )}

              {/* ANALYZE */}

              <button
                onClick={handleUpload}
                disabled={loading}
                className={`
                  mt-7
                  px-7 py-3
                  rounded-2xl
                  transition
                  font-medium
                  text-[15px]
                  ${
                    loading
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-blue-600 text-white hover:bg-blue-700 hover:scale-[1.02]"
                  }
                `}
              >
                {loading ? (
                  <div className="flex items-center gap-3">
                    <div
                      className="
        w-4 h-4
        border-2
        border-white/40
        border-t-white
        rounded-full
        animate-spin
      "
                    ></div>

                    <span>Analyse en cours...</span>
                  </div>
                ) : (
                  "Analyser le CV"
                )}
              </button>
            </div>
          </motion.div>

          {/* RIGHT SIDE */}

          <div className="space-y-6">
            {result && (
              <>
                {/* TOP GRID */}

                <div
                  className="
                  grid
                  grid-cols-1
                  md:grid-cols-[1.6fr_0.8fr_1fr]
                  gap-6
                "
                >
                  {/* SALARY */}

                  <motion.div
                    whileHover={{ y: -2 }}
                    className="
                      bg-white
                      rounded-[30px]
                      border border-black/[0.04]
                      p-8
                      shadow-[0_10px_30px_rgba(0,0,0,0.03)]
                    "
                  >
                    <p
                      className="
                      text-[11px]
                      uppercase
                      tracking-[0.22em]
                      text-black/35
                      mb-5
                    "
                    >
                      Salaire Estimé
                    </p>

                    <h2
                      className="
                      text-[72px]
                      font-semibold
                      tracking-[-0.05em]
                      leading-none
                    "
                    >
                      ${Math.round(result.predicted_salary).toLocaleString()}
                    </h2>

                    <div
                      className="
                      mt-6
                      flex items-center gap-2
                      text-green-600
                      text-sm
                    "
                    >
                      <TrendingUp className="w-4 h-4" />
                      Évaluation IA du marché
                    </div>
                  </motion.div>

                  {/* SCORE */}

                  <motion.div
                    whileHover={{ y: -2 }}
                    className="
                      bg-white
                      rounded-[30px]
                      border border-black/[0.04]
                      p-6
                      shadow-[0_10px_30px_rgba(0,0,0,0.03)]
                    "
                  >
                    <p
                      className="
                      text-[11px]
                      uppercase
                      tracking-[0.22em]
                      text-black/35
                    "
                    >
                      Score du Profil
                    </p>

                    <div className="mt-6">
                      <h2
                        className="
                        text-[64px]
                        font-semibold
                        tracking-[-0.05em]
                        leading-none
                      "
                      >
                        {result.score}
                        <p
                          className="
  text-[15px]
  text-black/55
  mt-2
"
                        >
                          {result.score_label}
                        </p>
                      </h2>

                      <p
                        className="
                        text-black/50
                        mt-2
                        text-[15px]
                      "
                      >
                        {result.percentile} des profils
                      </p>
                    </div>

                    <div
                      className="
                      mt-8
                      h-2
                      bg-black/[0.05]
                      rounded-full
                      overflow-hidden
                    "
                    >
                      <div
                        className="
                        h-full
                        bg-blue-600
                        rounded-full
                      "
                        style={{
                          width: `${result.score}%`,
                        }}
                      ></div>
                    </div>
                  </motion.div>

                  {/* MARKET */}

                  <motion.div
                    whileHover={{ y: -2 }}
                    className="
                      bg-white
                      rounded-[30px]
                      border border-black/[0.04]
                      p-6
                      shadow-[0_10px_30px_rgba(0,0,0,0.03)]
                    "
                  >
                    <p
                      className="
                      text-[11px]
                      uppercase
                      tracking-[0.22em]
                      text-black/35
                    "
                    >
                      Position Marché
                    </p>

                    <div
                      className="
                      flex items-start
                      gap-4
                      mt-8
                    "
                    >
                      <div
                        className="
                        w-12 h-12
                        rounded-2xl
                        bg-blue-50
                        flex items-center justify-center
                        shrink-0
                      "
                      >
                        <Globe
                          className="
                          text-blue-600
                          w-5 h-5
                        "
                        />
                      </div>

                      <div>
                        <h3
                          className="
                          text-[34px]
                          font-semibold
                          tracking-[-0.04em]
                          leading-none
                        "
                        >
                          {result.market_position}
                        </h3>

                        <p
                          className="
                          text-black/50
                          text-[14px]
                          mt-3
                          leading-relaxed
                        "
                        >
                          Basé sur les tendances actuelles du marché.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* LOWER GRID */}

                <div
                  className="
                  grid
                  grid-cols-1
                  lg:grid-cols-[1fr_1.1fr]
                  gap-6
                "
                >
                  {/* PROFILE */}

                  <motion.div
                    whileHover={{ y: -2 }}
                    className="
                      bg-white
                      rounded-[30px]
                      border border-black/[0.04]
                      p-6
                      shadow-[0_10px_30px_rgba(0,0,0,0.03)]
                    "
                  >
                    <h2
                      className="
                      text-[32px]
                      font-semibold
                      tracking-[-0.04em]
                      mb-8
                    "
                    >
                      Profil Extrait
                    </h2>

                    <div className="space-y-6">
                      <div className="flex justify-between">
                        <span className="text-black/45">Poste</span>

                        <span className="font-medium">
                          {result.used_for_prediction.job_title}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-black/45">Pays</span>

                        <span className="font-medium">
                          {result.used_for_prediction.country}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-black/45">Expérience</span>

                        <span className="font-medium">
                          {result.used_for_prediction.min_experience_years} ans
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-black/45">Taille Entreprise</span>

                        <span className="font-medium">
                          {result.used_for_prediction.company_size}
                        </span>
                      </div>
                    </div>
                  </motion.div>

                  {/* EXPLANATION */}

                  <motion.div
                    whileHover={{ y: -2 }}
                    className="
                      bg-white
                      rounded-[30px]
                      border border-black/[0.04]
                      p-6
                      shadow-[0_10px_30px_rgba(0,0,0,0.03)]
                    "
                  >
                    <div
                      className="
                      flex items-center
                      gap-3
                      mb-8
                    "
                    >
                      <div
                        className="
                        w-11 h-11
                        rounded-2xl
                        bg-blue-50
                        flex items-center justify-center
                      "
                      >
                        <Brain
                          className="
                          text-blue-600
                          w-5 h-5
                        "
                        />
                      </div>

                      <h2
                        className="
                        text-[32px]
                        font-semibold
                        tracking-[-0.04em]
                      "
                      >
                        Analyse IA
                      </h2>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      {result.explanation.map((item, index) => (
                        <div
                          key={index}
                          className="
                            bg-[#f8f8f7]
                            border border-black/[0.04]
                            rounded-2xl
                            p-5
                            transition
                            hover:bg-white
                          "
                        >
                          <div className="flex items-start gap-4">
                            <div
                              className="
                                w-10 h-10
                                rounded-xl
                                bg-blue-50
                                flex items-center justify-center
                                shrink-0
                              "
                            >
                              <Brain
                                className="
                                  text-blue-600
                                  w-4 h-4
                                "
                              />
                            </div>

                            <div>
                              <h3
                                className="
                                  text-[15px]
                                  font-semibold
                                  mb-1
                                "
                              >
                                Insight IA
                              </h3>

                              <p
                                className="
                                  text-[14px]
                                  text-black/60
                                  leading-relaxed
                                "
                              >
                                {item}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* CHART */}

        {trajectory.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="
              mt-4
              bg-white
              rounded-[34px]
              border border-black/[0.04]
              p-8
              shadow-[0_10px_30px_rgba(0,0,0,0.03)]
            "
          >
            <div className="mb-8">
              <h2
                className="
                text-[44px]
                font-semibold
                tracking-[-0.04em]
                leading-none
              "
              >
                Projection d’Évolution Salariale
              </h2>

              <p
                className="
                text-black/50
                mt-3
                text-[16px]
              "
              >
                Projection de l’évolution salariale selon l’expérience
                professionnelle.
              </p>
            </div>

            <div className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trajectory}>
                  <defs>
                    <linearGradient
                      id="salaryGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor="#2563eb"
                        stopOpacity={0.22}
                      />

                      <stop offset="100%" stopColor="#2563eb" stopOpacity={0} />
                    </linearGradient>
                  </defs>

                  <CartesianGrid strokeDasharray="3 3" stroke="#ececec" />

                  <XAxis
                    dataKey="experience"
                    axisLine={false}
                    tickLine={false}
                    stroke="#999"
                    tickFormatter={(value) => `${value} ans`}
                    label={{
                      value: "Expérience",
                      position: "insideBottom",
                      offset: -5,
                    }}
                  />

                  <YAxis axisLine={false} tickLine={false} stroke="#999" />

                  <Tooltip
                    content={<CustomTooltip />}
                    cursor={{
                      stroke: "#2563eb",
                      strokeWidth: 1,
                      strokeDasharray: "4 4",
                    }}
                  />

                  <Area
                    type="monotone"
                    dataKey="salary"
                    stroke="#2563eb"
                    strokeWidth={4}
                    fill="url(#salaryGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        )}
      </section>
    </div>
  );
}
