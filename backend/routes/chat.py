from fastapi import APIRouter
from pydantic import BaseModel
from services.claude_ai import chat
from services.legiscan import get_bill, get_bill_text

router = APIRouter()


class Message(BaseModel):
    role: str  # "user" or "assistant"
    content: str


class ChatRequest(BaseModel):
    messages: list[Message]
    bill_id: int | None = None
    profile: dict | None = None


@router.post("/chat")
async def chat_endpoint(req: ChatRequest):
    bill_context = ""
    if req.bill_id:
        bill = await get_bill(req.bill_id)
        if bill:
            texts = bill.get("texts", [])
            bill_text = ""
            if texts:
                doc_id = texts[0].get("doc_id")
                if doc_id:
                    bill_text = await get_bill_text(doc_id) or ""
            bill_context = (
                f"Bill {bill.get('bill_number', '')}: {bill.get('title', '')}\n"
                f"Description: {bill.get('description', '')}\n"
            )
            if bill_text:
                bill_context += f"Text excerpt: {bill_text[:3000]}"

    messages = [{"role": m.role, "content": m.content} for m in req.messages]
    reply = await chat(messages, bill_context, req.profile)
    return {"reply": reply}
