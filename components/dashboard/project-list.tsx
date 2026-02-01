"use client";

import { motion } from "framer-motion";
import { ProjectCard } from "./project-card";

const projects = [
  { slug: "k", title: "Project K", subtitle: "Specimen K" },
  { slug: "s", title: "Project S", subtitle: "Specimen S" },
  { slug: "e", title: "Project E", subtitle: "Specimen E" },
  { slug: "x", title: "Project X", subtitle: "Specimen X" },
  { slug: "alpha", title: "Project α", subtitle: "Specimen α" },
] as const;

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.06,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
};

export function ProjectList() {
  return (
    <motion.ul
      className="space-y-3"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {projects.map((project) => (
        <motion.li key={project.slug} variants={item}>
          <ProjectCard
            href={`/project/${project.slug}`}
            title={project.title}
            subtitle={project.subtitle}
          />
        </motion.li>
      ))}
    </motion.ul>
  );
}
