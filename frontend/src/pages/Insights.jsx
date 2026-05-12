import { useEffect, useState } from "react";

import { Link } from "react-router-dom";

import { motion } from "framer-motion";

import { Globe, TrendingUp, Briefcase, BarChart3 } from "lucide-react";

import { getMarketInsights } from "../services/api";

export default function Insights() {
  const [data, setData] = useState(null);

  const [loading, setLoading] = useState(true);

  // =========================
  // FETCH DATA
  // =========================

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const res = await getMarketInsights();

        setData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchInsights();
  }, []);

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <div
        className="
        min-h-screen
        bg-[#f6f6f3]
        flex items-center justify-center
      "
      >
        <div
          className="
          w-10 h-10
          border-4
          border-blue-200
          border-t-blue-600
          rounded-full
          animate-spin
        "
        ></div>
      </div>
    );
  }

  return (
    <div
      className="
      min-h-screen
      bg-[#f6f6f3]
      text-[#111]
    "
    >
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
          px-8 py-5
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
            <Link to="/" className="hover:text-black transition">
              Analyseur
            </Link>

            <Link to="/insights" className="text-black font-medium">
              Insights
            </Link>

            <Link to="/simulator" className="hover:text-black transition">
              Simulateur
            </Link>
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
        <h1
          className="
          text-[54px]
          font-semibold
          tracking-[-0.04em]
          leading-none
        "
        >
          Global Market Insights
        </h1>

        <p
          className="
          mt-5
          text-black/55
          text-[18px]
          max-w-3xl
          leading-relaxed
        "
        >
          Real-time analytics and salary intelligence computed from AI and data
          market trends.
        </p>
      </section>

      {/* CONTENT */}

      <section
        className="
        max-w-[1350px]
        mx-auto
        px-8
        py-8
      "
      >
        {/* TOP METRICS */}

        <div
          className="
          grid
          grid-cols-1
          md:grid-cols-4
          gap-6
        "
        >
          {/* AVG SALARY */}

          <motion.div
            whileHover={{ y: -3 }}
            className="
              bg-white
              rounded-[30px]
              border border-black/[0.04]
              p-7
            "
          >
            <div
              className="
              w-12 h-12
              rounded-2xl
              bg-blue-50
              flex items-center justify-center
              mb-6
            "
            >
              <BarChart3
                className="
                text-blue-600
                w-5 h-5
              "
              />
            </div>

            <p
              className="
              text-black/45
              text-sm
            "
            >
              Average AI Salary
            </p>

            <h2
              className="
              text-[48px]
              font-semibold
              tracking-[-0.04em]
              mt-4
            "
            >
              ${data.average_salary.toLocaleString()}
            </h2>
          </motion.div>

          {/* REMOTE */}

          <motion.div
            whileHover={{ y: -3 }}
            className="
              bg-white
              rounded-[30px]
              border border-black/[0.04]
              p-7
            "
          >
            <div
              className="
              w-12 h-12
              rounded-2xl
              bg-blue-50
              flex items-center justify-center
              mb-6
            "
            >
              <TrendingUp
                className="
                text-blue-600
                w-5 h-5
              "
              />
            </div>

            <p
              className="
              text-black/45
              text-sm
            "
            >
              Remote Premium
            </p>

            <h2
              className="
              text-[48px]
              font-semibold
              tracking-[-0.04em]
              mt-4
            "
            >
              +{data.remote_premium}%
            </h2>
          </motion.div>

          {/* ROLE */}

          <motion.div
            whileHover={{ y: -3 }}
            className="
              bg-white
              rounded-[30px]
              border border-black/[0.04]
              p-7
            "
          >
            <div
              className="
              w-12 h-12
              rounded-2xl
              bg-blue-50
              flex items-center justify-center
              mb-6
            "
            >
              <Briefcase
                className="
                text-blue-600
                w-5 h-5
              "
              />
            </div>

            <p
              className="
              text-black/45
              text-sm
            "
            >
              Top Paying Role
            </p>

            <h2
              className="
              text-[34px]
              font-semibold
              tracking-[-0.04em]
              mt-4
            "
            >
              {data.fastest_growing_role}
            </h2>
          </motion.div>

          {/* COUNTRIES */}

          <motion.div
            whileHover={{ y: -3 }}
            className="
              bg-white
              rounded-[30px]
              border border-black/[0.04]
              p-7
            "
          >
            <div
              className="
              w-12 h-12
              rounded-2xl
              bg-blue-50
              flex items-center justify-center
              mb-6
            "
            >
              <Globe
                className="
                text-blue-600
                w-5 h-5
              "
              />
            </div>

            <p
              className="
              text-black/45
              text-sm
            "
            >
              Top Market
            </p>

            <h2
              className="
              text-[34px]
              font-semibold
              tracking-[-0.04em]
              mt-4
            "
            >
              {data.top_countries[0].country}
            </h2>
          </motion.div>
        </div>

        {/* LOWER GRID */}

        <div
          className="
          grid
          grid-cols-1
          lg:grid-cols-2
          gap-6
          mt-8
        "
        >
          {/* ROLES */}

          <div
            className="
            bg-white
            rounded-[30px]
            border border-black/[0.04]
            p-8
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
              Top Paying Roles
            </h2>

            <div className="space-y-6">
              {data.top_roles.map((role, index) => (
                <div key={index}>
                  <div
                    className="
                    flex justify-between
                    mb-2
                  "
                  >
                    <span
                      className="
                      text-[15px]
                      text-black/65
                    "
                    >
                      {role.job_title}
                    </span>

                    <span
                      className="
                      font-medium
                    "
                    >
                      ${role.salary.toLocaleString()}
                    </span>
                  </div>

                  <div
                    className="
                    h-3
                    bg-black/[0.04]
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
                        width: `${Math.min(role.salary / 2000, 100)}%`,
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* COUNTRIES */}

          <div
            className="
            bg-white
            rounded-[30px]
            border border-black/[0.04]
            p-8
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
              Top Paying Countries
            </h2>

            <div className="space-y-6">
              {data.top_countries.map((country, index) => (
                <div key={index}>
                  <div
                    className="
                    flex justify-between
                    mb-2
                  "
                  >
                    <span
                      className="
                      text-[15px]
                      text-black/65
                    "
                    >
                      {country.country}
                    </span>

                    <span
                      className="
                      font-medium
                    "
                    >
                      ${country.salary.toLocaleString()}
                    </span>
                  </div>

                  <div
                    className="
                    h-3
                    bg-black/[0.04]
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
                        width: `${Math.min(country.salary / 2000, 100)}%`,
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
