import {
  Github,
  Linkedin,
  Instagram,
  Code,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function Watermark() {
  const socialLinks = [
    {
      href: "https://github.com/atikx",
      icon: Github,
      label: "GitHub",
      hoverColor: "hover:text-gray-900 dark:hover:text-white",
      bgHover: "hover:bg-gray-200 dark:hover:bg-gray-700",
    },
    {
      href: "https://www.linkedin.com/in/atikx/",
      icon: Linkedin,
      label: "LinkedIn",
      hoverColor: "hover:text-blue-700 dark:hover:text-blue-400",
      bgHover: "hover:bg-blue-100 dark:hover:bg-blue-900",
    },
    {
      href: "https://www.instagram.com/i.atikx/",
      icon: Instagram,
      label: "Instagram",
      hoverColor: "hover:text-pink-700 dark:hover:text-pink-400",
      bgHover: "hover:bg-pink-100 dark:hover:bg-pink-900",
    },
    
  ];

  return (
    <TooltipProvider>
      <footer className="w-full border-t border-border/60 bg-gradient-to-r from-background via-muted/20 to-background">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            {/* Developer branding */}
            <div className="flex items-center space-x-3 font-mono text-sm">
              <Code className="h-4 w-4 text-primary" />
              <span className="text-foreground/80 font-medium">const developer =</span>
              <Badge
                variant="secondary"
                className="px-3 py-1 bg-gradient-to-r from-primary/20 to-primary/10 border border-primary/30 shadow-sm"
              >
                <span className="font-semibold text-primary">
                  Atiksh Gupta
                </span>
              </Badge>
              <span className="text-foreground/80 font-medium">;</span>
            </div>

            {/* Social links */}
            <div className="flex items-center space-x-2">
              {socialLinks.map((link) => (
                <Tooltip key={link.label}>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`${link.hoverColor} ${link.bgHover} transition-all duration-300 hover:scale-110 group text-foreground/70 hover:shadow-sm border border-transparent hover:border-border/20`}
                      asChild
                    >
                      <a
                        href={link.href}
                        target={
                          link.href.startsWith("mailto") ? undefined : "_blank"
                        }
                        rel={
                          link.href.startsWith("mailto")
                            ? undefined
                            : "noopener noreferrer"
                        }
                        aria-label={`${link.label} Profile`}
                      >
                        <link.icon className="h-4 w-4 transition-transform duration-300 group-hover:rotate-12" />
                      </a>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{link.label}</p>
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </TooltipProvider>
  );
}
