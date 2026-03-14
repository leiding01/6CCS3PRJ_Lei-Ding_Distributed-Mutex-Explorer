% informatics-report.cls
% Clean fallback class for a final-year engineering-style report.
% Designed for pdfLaTeX on Overleaf.

\NeedsTeXFormat{LaTeX2e}
\ProvidesClass{informatics-report}[2026/02/19 Informatics Report Class]

% ------------------------------------------------------------
% Base class
% ------------------------------------------------------------
\LoadClass[11pt,a4paper,oneside]{report}

% ------------------------------------------------------------
% Encoding and fonts
% ------------------------------------------------------------
\RequirePackage[utf8]{inputenc}
\RequirePackage[T1]{fontenc}
\RequirePackage{newtxtext,newtxmath} % Times-like text and math
\RequirePackage{microtype}
\RequirePackage{tabularx}

% ------------------------------------------------------------
% Layout and spacing
% ------------------------------------------------------------
\RequirePackage[a4paper,margin=27mm]{geometry}
\RequirePackage{setspace}
\setstretch{1.15}

\setlength{\parindent}{15pt}
\setlength{\parskip}{0pt}

% ------------------------------------------------------------
% Core packages
% ------------------------------------------------------------
\RequirePackage{graphicx}
\RequirePackage{xcolor}
\RequirePackage{booktabs}
\RequirePackage{longtable}
\RequirePackage{array}
\RequirePackage{amsmath}
\RequirePackage{enumitem}
\RequirePackage{caption}
\RequirePackage{titlesec}
\RequirePackage{fancyhdr}
\RequirePackage[numbers]{natbib}
\RequirePackage{url}
\RequirePackage[colorlinks=true]{hyperref}

% ------------------------------------------------------------
% Colour palette
% ------------------------------------------------------------
\definecolor{deepblue}{HTML}{123B7A}

\hypersetup{
  linkcolor=deepblue,
  citecolor=deepblue,
  urlcolor=deepblue
}

% ------------------------------------------------------------
% Lists
% ------------------------------------------------------------
\setlist[itemize]{topsep=4pt,itemsep=2pt,parsep=0pt}
\setlist[enumerate]{topsep=4pt,itemsep=2pt,parsep=0pt}

% ------------------------------------------------------------
% Headings
% ------------------------------------------------------------
\titleformat{\chapter}[display]
  {\normalfont\bfseries\Huge\color{deepblue}}
  {\filleft\Large\color{deepblue}\chaptername\ \thechapter}
  {0.6ex}
  {\titlerule[1pt]\vspace{1ex}\filright}
  [\vspace{1ex}\titlerule]

\titlespacing*{\chapter}{0pt}{0pt}{2.0ex}

\titleformat{\section}
  {\normalfont\bfseries\Large\color{deepblue}}
  {\thesection}{0.8em}{}

\titleformat{\subsection}
  {\normalfont\bfseries\large\color{deepblue}}
  {\thesubsection}{0.8em}{}

\titleformat{\subsubsection}
  {\normalfont\bfseries\normalsize\color{deepblue}}
  {\thesubsubsection}{0.8em}{}

% ------------------------------------------------------------
% Captions
% ------------------------------------------------------------
\captionsetup[figure]{
  position=bottom,
  font={small,it},
  labelfont={bf,color=deepblue},
  labelsep=colon,
  justification=raggedright,
  singlelinecheck=false
}

\captionsetup[table]{
  position=top,
  font=small,
  labelfont={bf,color=deepblue},
  labelsep=colon,
  justification=raggedright,
  singlelinecheck=false
}

% ------------------------------------------------------------
% Page style
% ------------------------------------------------------------
\pagestyle{fancy}
\fancyhf{}
\fancyfoot[C]{\thepage}
\renewcommand{\headrulewidth}{0pt}
\renewcommand{\footrulewidth}{0pt}

\fancypagestyle{plain}{
  \fancyhf{}
  \fancyfoot[C]{\thepage}
  \renewcommand{\headrulewidth}{0pt}
  \renewcommand{\footrulewidth}{0pt}
}

% ------------------------------------------------------------
% TOC depth
% ------------------------------------------------------------
\setcounter{secnumdepth}{3}
\setcounter{tocdepth}{2}

% ------------------------------------------------------------
% General formatting
% ------------------------------------------------------------
\raggedbottom