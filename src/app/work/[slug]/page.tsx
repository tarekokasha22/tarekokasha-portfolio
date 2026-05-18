import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getCaseStudy, getAllSlugs } from "@/lib/mdx";
import { CaseStudyLayout } from "@/components/case-study/CaseStudyLayout";
import { StatGroup, Stat } from "@/components/case-study/StatGroup";

const components = { StatGroup, Stat };

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const study = getCaseStudy(slug);
  if (!study) return { title: "Not Found" };
  return {
    title: study.frontmatter.title,
    description: study.frontmatter.oneLineOutcome,
  };
}

export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export default async function CaseStudyPage({ params }: Props) {
  const { slug } = await params;
  const study = getCaseStudy(slug);
  if (!study) notFound();

  return (
    <CaseStudyLayout frontmatter={study.frontmatter} slug={slug}>
      <MDXRemote source={study.content} components={components} />
    </CaseStudyLayout>
  );
}
