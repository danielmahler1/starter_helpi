import React, { useState } from "react";
import getCareerAdvice from "../Components/API";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import GradientShadowButton from "../Components/GradientShadowButton";
import BeamInput from "../Components/BeamInput";
import SteppedProgress from "../Components/SteppedProgress";
import "../Styles/DetailedQuestions.css";
import BarLoader from "../Components/BarLoader";
import ResultsModal from "../Components/ResultsModal";
import StaggeredDropDown from "../Components/StaggeredDropDown";

type QuestionType = {
  question: string;
};

interface Result {
  title: string;
  description: string;
}

const sampleQuestions: QuestionType[] = [
  { question: "Describe a project or task where you felt the most engaged and fulfilled. What were you doing, and why did it feel significant to you?" },
  { question: "What specific aspects of your previous jobs have you liked and disliked? (Consider aspects like company culture, management style, job duties, etc.)" },
  { question: "How do you handle stress and pressure at work? Can you provide an example of a stressful situation and how you managed it?" },
  { question: "What are your long-term career aspirations? Where do you see yourself in 5, 10, and 20 years?" },
  { question: "What are your strengths and weaknesses as they relate to your desired career field?" },
  { question: "If you had the opportunity to learn any new skill without restrictions, what skill would you choose and why?" },
  { question: "What values are most important to you in a workplace? How do you evaluate a potential employer's alignment with these values?" },
];

const DetailedQuestion = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<string[]>(Array(sampleQuestions.length).fill(""));
  const [quizStarted, setQuizStarted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const saveResultsToLocalStorage = (newResult: Result) => {
    const existingResults = JSON.parse(localStorage.getItem("quizResults") || "[]");
    const updatedResults = [...existingResults, newResult];
    localStorage.setItem("quizResults", JSON.stringify(updatedResults));
  };

  const handleApiSuccess = (apiResponse: string) => {
    try {
      const advice = JSON.parse(apiResponse);
      toast.success("Career Advice Generated Successfully");
      setResult(advice);
      const timestamp = new Date().toLocaleString();
      const title = `Results - ${timestamp}`;
      const newResult = {
        questionType: "Detailed Questions",
        title: title,
        description: JSON.stringify(advice, null, 2),
      };
      saveResultsToLocalStorage(newResult);
      setIsModalOpen(true);
    } catch (error) {
      if (error instanceof Error) {
        toast.error("Error parsing career advice: " + error.message);
      }
    }
  };

  const handleInputValueChange = (value: string) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = value;
    setAnswers(newAnswers);
  };

  const onStepClick = (stepIndex: number) => {
    if (stepIndex <= currentQuestionIndex) {
      setCurrentQuestionIndex(stepIndex);
    }
  };

  const moveToNextQuestion = async () => {
    if (answers[currentQuestionIndex].trim() === "") {
      toast.error("An Answer is Required!");
      return;
    }

    const nextQuestionIndex = currentQuestionIndex + 1;
    if (nextQuestionIndex < sampleQuestions.length) {
      setCurrentQuestionIndex(nextQuestionIndex);
    } else {
      setIsLoading(true);
      const buildPrompt = (answers: string[]) => {
        return `Given the following details about a user:
          - Describe a project or task where you felt the most engaged and fulfilled. What were you doing, and why did it feel significant to you?: ${answers[0]}
          - What specific aspects of your previous jobs have you liked and disliked? (Consider aspects like company culture, management style, job duties, etc.): ${answers[1]}
          - How do you handle stress and pressure at work? Can you provide an example of a stressful situation and how you managed it?: ${answers[2]}
          - What are your long-term career aspirations? Where do you see yourself in 5, 10, and 20 years?: ${answers[3]}
          - What are your strengths and weaknesses as they relate to your desired career field?: ${answers[4]}
          - If you had the opportunity to learn any new skill without restrictions, what skill would you choose and why?: ${answers[5]}
          - What values are most important to you in a workplace? How do you evaluate a potential employer's alignment with these values?: ${answers[6]}
        
        Generate a detailed career advice response including:
        1. The recommended career path.
        2. A brief summary of this career path.
        3. Three other jobs that might also suit the user's profile. For each job, provide a title and a short summary. Keep each descritipn short and to the point, 2 sentences max.
        
        Format your response as follows:
        {
          "recommended_job": "Job title",
          "job_summary": "A brief summary of the job.",
          "other_jobs": [
            {"title": "Job1", "summary": "Brief summary of Job1"},
            {"title": "Job2", "summary": "Brief summary of Job2"},
            {"title": "Job3", "summary": "Brief summary of Job3"}
          ]
        }`;
      };
      const prompt = buildPrompt(answers);
      const messages = [{ role: "user", content: prompt }]; // Wrap the prompt in the correct format
      try {
        const apiResponse = await getCareerAdvice(messages); // Now passing the correct type
        handleApiSuccess(apiResponse);
      } catch (error) {
        if (error instanceof Error) {
          toast.error("Error Generating Career Advice: " + error.message);
        } else {
          toast.error("Error Generating Career Advice: " + String(error));
        }
      } finally {
        setIsLoading(false);
      }
    }
  };

  const startQuiz = () => {
    setQuizStarted(true);
  };

  const resetQuiz = () => {
    setQuizStarted(false);
    setCurrentQuestionIndex(0);
    setAnswers(Array(sampleQuestions.length).fill(""));
    setResult("");
    setIsModalOpen(false);
    toast.success("Quiz Reset Successfully");
  };

  return (
    <section className="flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-slate-900 px-4 py-12 text-slate-50 relative">
      <span className="absolute -top-[350px] left-[50%] z-0 h-[500px] w-[600px] -translate-x-[50%] rounded-full bg-gradient-to-r from-violet-600/20 to-indigo-600/20 blur-3xl" />
      <StaggeredDropDown resetQuiz={resetQuiz} />

      <div className="flex flex-col items-center justify-start p-5 text-center text-white bg-dark-gray rounded-lg shadow-custom overflow-y-auto w-full h-[400px] mx-auto my-5 md:max-w-xl lg:max-w-2xl">
        {isLoading ? (
          <div className="loading-modal">
            <div className="loading-text">Generating Career Advice...</div>
            <BarLoader />
          </div>
        ) : quizStarted ? (
          <>
            <h1 className="text-2xl md:text-3xl font-bold mb-4 ">Detailed Questions</h1>
            <SteppedProgress stepsComplete={currentQuestionIndex} numSteps={sampleQuestions.length} onStepClick={onStepClick} />
            <h2 className="text-xl font-medium mt-5">{sampleQuestions[currentQuestionIndex].question}</h2>
            <div className="beam-input-container">
              <BeamInput inputValue={answers[currentQuestionIndex]} setInputValue={handleInputValueChange} onSubmit={() => moveToNextQuestion()} />
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center p-6 text-center my-auto">
            <h1 className="text-white mb-4 text-3xl">Detailed Questions Quiz</h1>
            <p className="mb-6 text-white">Click below to start the quiz. Answer some questions to find out more about your preferences!</p>
            <GradientShadowButton onClick={startQuiz} buttonText="Start Quiz" />
          </div>
        )}
        <ResultsModal isOpen={isModalOpen} setIsOpen={setIsModalOpen} result={result} resetQuiz={resetQuiz} />
      </div>
    </section>
  );
};

export default DetailedQuestion;
