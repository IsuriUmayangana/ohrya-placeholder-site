"use client";

import { useState } from "react";

const FAQ_ITEMS = [
  {
    id: "faq-1",
    question: "What is the $2,500 campaign?",
    answer:
      "The $2,500 Campaign is OHRYA's way of rewarding participation. Join a campaign, share your unique link, and inspire others to participate. The top eligible participant with the highest participation score wins $2,500 and directs another $2,500 to the charity of their choice, bringing the total campaign reward to $5,000.",
  },
  {
    id: "faq-2",
    question: "Is a donation required?",
    answer:
      "No. Joining OHRYA and participating in campaigns is completely free. There are no donations, hidden fees, or commitments required to take part. Simply sign up, share your unique link, and start creating impact.",
  },
  {
    id: "faq-3",
    question: "How is my Participation Score calculated?",
    answer:
      "Your Participation Score is designed to recognize the impact you create. Every eligible participant who joins through your unique referral link earns you points toward your Participation Score. The more people you inspire to participate, the higher your score and position on the leaderboard.",
  },
  {
    id: "faq-4",
    question: "How are referrals tracked?",
    answer:
      "Every participant receives a unique referral link to share. When someone joins through your link and completes the required participation steps, OHRYA automatically recognizes that connection and updates your Participation Score.",
  },
];

export default function Faq() {
  const [openId, setOpenId] = useState<string | null>(FAQ_ITEMS[0].id);

  function toggle(id: string) {
    setOpenId((current) => (current === id ? null : id));
  }

  return (
    <section className="faq-section">
      <div className="faq-list">
        {FAQ_ITEMS.map((item) => {
          const isOpen = openId === item.id;
          return (
            <article key={item.id} className={`faq-item${isOpen ? " is-open" : ""}`}>
              <button
                className="faq-question"
                type="button"
                aria-expanded={isOpen}
                aria-controls={item.id}
                onClick={() => toggle(item.id)}
              >
                <span>{item.question}</span>
                <svg className="faq-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path
                    d="M6 14l6-6 6 6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              <div className="faq-answer" id={item.id}>
                <div className="faq-answer-inner">
                  <p>{item.answer}</p>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
