import fs from "fs";
import path from "path";
import matter from "gray-matter";

const contentDir = path.join(process.cwd(), "src/content/work");

export interface CaseStudyFrontmatter {
  title: string;
  slug: string;
  client: string;
  year: number;
  role: string;
  duration: string;
  oneLineOutcome: string;
  tags: string[];
  publishedAt: string;
  order: number;
  featured: boolean;
}

export interface CaseStudy {
  frontmatter: CaseStudyFrontmatter;
  content: string;
  slug: string;
}

export function getAllCaseStudies(): CaseStudy[] {
  if (!fs.existsSync(contentDir)) return [];
  const files = fs.readdirSync(contentDir).filter((f) => f.endsWith(".mdx"));
  return files
    .map((file) => {
      const slug = file.replace(".mdx", "");
      const raw = fs.readFileSync(path.join(contentDir, file), "utf-8");
      const { data, content } = matter(raw);
      return { frontmatter: data as CaseStudyFrontmatter, content, slug };
    })
    .sort((a, b) => a.frontmatter.order - b.frontmatter.order);
}

export function getCaseStudy(slug: string): CaseStudy | null {
  const filePath = path.join(contentDir, `${slug}.mdx`);
  if (!fs.existsSync(filePath)) return null;
  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);
  return { frontmatter: data as CaseStudyFrontmatter, content, slug };
}

export function getAllSlugs(): string[] {
  if (!fs.existsSync(contentDir)) return [];
  return fs
    .readdirSync(contentDir)
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => f.replace(".mdx", ""));
}
