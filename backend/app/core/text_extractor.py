import re
from typing import Dict, Optional, List

SKILLS_DB = [
    "Nextjs",
    "React",
    "Tailwind CSS",
    "Javascript",
    "Python",
    "NodeJS",
    "C++",
    "C#",
    "PHP",
    "HTML/CSS",
    "Bootstrap",
    "MongoDB",
    "MySQL",
    "Android",
    "kỹ năng bán hàng",
    "bán hàng",
    "quản trị kinh doanh",
    "khách hàng",
    "Gemini",
    "ChatGPT",
]


def extract_name(text: str) -> Optional[str]:
    """
    Sử dụng nhiều quy tắc, bao gồm cả ngữ cảnh (chức danh) để tìm tên.
    """
    lines = [line.strip() for line in text.strip().split("\n") if line.strip()]
    if not lines:
        return None

    # --- QUY TẮC 1: TÌM TÊN ĐỨNG TRƯỚC CHỨC DANH (MẠNH NHẤT) ---
    job_title_keywords = [
        "developer",
        "engineer",
        "manager",
        "nhân viên",
        "chuyên viên",
        "kỹ sư",
    ]
    for i, line in enumerate(lines):
        # Kiểm tra xem dòng có chứa từ khóa chức danh không
        if any(keyword in line.lower() for keyword in job_title_keywords):
            # Nếu có, dòng ngay phía trước (i-1) có khả năng cao là tên
            if i > 0:
                candidate_name = lines[i - 1]
                # Kiểm tra lại xem dòng đó có thực sự giống tên không
                if (
                    not any(char.isdigit() for char in candidate_name)
                    and 2 <= len(candidate_name.split()) <= 5
                ):
                    return candidate_name

    # --- QUY TẮC 2: TÌM THEO CÁC MẪU CỐ ĐỊNH (dành cho CV dạng đơn) ---
    patterns = [r"(?i)(?:tôi\s+tên\s+là|tên\s+tôi\s+là|họ\s+và\s+tên)[\s:]*([^\n]+)"]
    for pattern in patterns:
        match = re.search(pattern, text)
        if match:
            name = match.group(1).strip()
            name = re.sub(r"(?i)\s*ngày\s+sinh.*", "", name).strip()
            return name

    # --- QUY TẮC 3: LẤY DÒNG ĐẦU TIÊN NẾU NÓ TRÔNG GIỐNG TÊN ---
    first_line = lines[0]
    header_keywords = [
        "profile",
        "education",
        "experience",
        "contact",
        "skills",
        "techniques",
    ]
    is_header = any(keyword in first_line.lower() for keyword in header_keywords)
    if (
        not is_header
        and not any(char.isdigit() for char in first_line)
        and 2 <= len(first_line.split()) <= 5
    ):
        return first_line

    # --- QUY TẮC 4: DỰ PHÒNG CUỐI CÙNG - TÊN NGƯỜI KÝ ---
    if len(lines) >= 2:
        last_line = lines[-1]
        if (
            not any(char.isdigit() for char in last_line)
            and 2 <= len(last_line.split()) <= 5
        ):
            return last_line

    return None


# --- CÁC HÀM KHÁC GIỮ NGUYÊN ---
def extract_contact_info(text: str) -> Dict[str, Optional[str]]:
    email_pattern = r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}"
    phone_pattern = r"(?i)(phone|sđt|số điện thoại)[\s:]*([0-9\s-]{9,12}\b)"
    email = re.search(email_pattern, text)
    phone_match = re.search(phone_pattern, text)
    phone = phone_match.group(2).strip() if phone_match else None
    if not phone:
        generic_phone_pattern = r"(\b(\+84|0)\d{9}\b)"
        generic_phone_match = re.search(generic_phone_pattern, text)
        phone = generic_phone_match.group(0) if generic_phone_match else None
    return {"email": email.group(0) if email else None, "phone": phone}


def extract_skills(text: str) -> Optional[List[str]]:
    found_skills = set()
    for skill in SKILLS_DB:
        pattern = r"\b" + re.escape(skill) + r"\b"
        if re.search(pattern, text, re.IGNORECASE):
            found_skills.add(skill)
    return list(found_skills) if found_skills else None


def extract_experience(text: str) -> Optional[List[Dict]]:
    experience_block = _find_section(
        text, ["kinh nghiệm làm việc", "kinh nghiệm", "experience"]
    )
    if not experience_block:
        return None
    experiences = []
    company_pos_pattern = re.compile(r"^(.*?)\s*\|\s*Position:\s*(.*?)$", re.MULTILINE)
    date_pattern = re.compile(
        r"^\d{1,2}(?:th|st|nd|rd)?\s+\w+\s*-\s*\d{1,2}(?:th|st|nd|rd)?\s+\w+\s+\d{4}",
        re.MULTILINE | re.IGNORECASE,
    )
    matches = company_pos_pattern.finditer(experience_block)
    for match in matches:
        company = match.group(1).strip()
        position = match.group(2).strip()
        sub_text_before = experience_block[: match.start()]
        date_match = list(date_pattern.finditer(sub_text_before))
        dates = date_match[-1].group(0) if date_match else None
        experiences.append({"company": company, "position": position, "dates": dates})
    return experiences if experiences else None


def _find_section(text: str, start_keywords: List[str]) -> Optional[str]:
    stop_keywords = [
        "học vấn",
        "education",
        "kỹ năng",
        "skills",
        "techniques",
        "projects",
        "hoạt động",
        "activities",
        "giải thưởng",
        "awards",
        "chứng chỉ",
        "certifications",
        "sở thích",
        "hobbies",
        "interests",
        "người tham chiếu",
        "references",
        "languages",
    ]
    start_pattern = r"(?i)^(" + "|".join(start_keywords) + r")"
    start_match = re.search(start_pattern, text, re.MULTILINE)
    if not start_match:
        return None
    text_after_start = text[start_match.end() :]
    end_index = len(text_after_start)
    for stop_word in stop_keywords:
        stop_pattern = r"(?i)^(" + stop_word + r")"
        stop_match = re.search(stop_pattern, text_after_start, re.MULTILINE)
        if stop_match and stop_match.start() < end_index:
            end_index = stop_match.start()
    section_block = text_after_start[:end_index].strip()
    return section_block


def extract_all_info(raw_text: str) -> Dict[str, any]:
    extracted_data = {}
    contact_info = extract_contact_info(raw_text)
    extracted_data.update(contact_info)
    name = extract_name(raw_text)
    extracted_data["name"] = name
    skills = extract_skills(raw_text)
    extracted_data["skills"] = skills
    experience = extract_experience(raw_text)
    extracted_data["experience"] = experience
    return extracted_data
