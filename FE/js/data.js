// 신고 데이터를 저장하고 불러오는 파일
// 서버가 없어서 브라우저의 localStorage에 저장한다.
// localStorage에는 글자만 저장할 수 있어서 JSON.stringify로 바꿔서 넣고 JSON.parse로 다시 꺼낸다.

// 처음 열었을 때 보여 줄 예시 신고들
const sampleReports = [
    {
        id: 1,
        type: "public",
        title: "샤워실 3번 칸 온수 안 나옴",
        place: "4층 공용 샤워실",
        room: "",
        facility: "샤워실",
        content: "3번 칸에서 찬물만 나와요. 다른 칸은 괜찮아요.",
        status: "완료",
        same: 7,
        date: "10월 28일",
        mine: true,
        pressedSame: false
    },
    {
        id: 2,
        type: "public",
        title: "2번 건조기 작동 안 됨",
        place: "3층 세탁실",
        room: "",
        facility: "건조기",
        content: "버튼을 눌러도 드럼이 돌아가지 않아요. 전원은 들어와요.",
        status: "수리 중",
        same: 5,
        date: "11월 3일",
        mine: false,
        pressedSame: false
    },
    {
        id: 3,
        type: "public",
        title: "1번 자판기 동전 걸림",
        place: "1층 휴게실",
        room: "",
        facility: "자판기",
        content: "500원을 넣으면 걸려서 안 들어가요. 반환 레버도 안 돼요.",
        status: "확인 중",
        same: 3,
        date: "11월 1일",
        mine: false,
        pressedSame: false
    },
    {
        id: 4,
        type: "public",
        title: "복도 끝 전등 깜빡임",
        place: "2층 복도",
        room: "",
        facility: "전등",
        content: "비상구 쪽 복도 끝 전등이 계속 깜빡여요.",
        status: "접수됨",
        same: 1,
        date: "11월 5일",
        mine: true,
        pressedSame: false
    },
    {
        id: 5,
        type: "room",
        title: "호실 천장 전등 안 켜짐",
        place: "",
        room: "312",
        facility: "전등",
        content: "스위치를 눌러도 천장 전등이 켜지지 않아요. 스탠드는 켜져요.",
        status: "확인 중",
        same: 0,
        date: "11월 4일",
        mine: true,
        pressedSame: false
    }
];

// 저장된 신고 목록 가져오기
function getReports() {
    const saved = localStorage.getItem("fdmReports");

    // 저장된 게 없으면 예시 신고를 저장하고 그걸 쓴다
    if (saved == null) {
        saveReports(sampleReports);
        localStorage.setItem("fdmNextId", "6");
        return sampleReports;
    }

    return JSON.parse(saved);
}

// 신고 목록 저장하기
function saveReports(reports) {
    localStorage.setItem("fdmReports", JSON.stringify(reports));
}

// id로 신고 하나 찾기
function findReport(reports, id) {
    for (let i = 0; i < reports.length; i++) {
        if (reports[i].id == id) {
            return reports[i];
        }
    }
    return null;
}

// 새 신고 번호 만들기
function getNextId() {
    let nextId = Number(localStorage.getItem("fdmNextId"));
    if (nextId == 0) {
        nextId = 100;
    }
    localStorage.setItem("fdmNextId", nextId + 1);
    return nextId;
}

// 오늘 날짜를 "11월 3일" 모양으로
function todayText() {
    const today = new Date();
    const month = today.getMonth() + 1;
    const day = today.getDate();
    return month + "월 " + day + "일";
}

// 상태 이름 -> CSS 클래스에 쓸 영어 이름
function statusClass(status) {
    if (status == "접수됨") {
        return "received";
    } else if (status == "확인 중") {
        return "checking";
    } else if (status == "수리 중") {
        return "repairing";
    } else {
        return "done";
    }
}

// 상태 이름 -> 몇 번째 단계인지
function statusStep(status) {
    if (status == "접수됨") {
        return 1;
    } else if (status == "확인 중") {
        return 2;
    } else if (status == "수리 중") {
        return 3;
    } else {
        return 4;
    }
}

// 상태 이름 -> 색깔
function statusColor(status) {
    if (status == "접수됨") {
        return "#6b7180";
    } else if (status == "확인 중") {
        return "#7b5fd6";
    } else if (status == "수리 중") {
        return "#d0752e";
    } else {
        return "#3a9a5c";
    }
}

// 상태마다 보여 줄 설명
function statusNote(status) {
    if (status == "접수됨") {
        return "신고가 접수됐어요. 사감 선생님이 확인하면 '확인 중'으로 바뀌어요.";
    } else if (status == "확인 중") {
        return "사감 선생님이 신고 내용을 확인했어요. 수리 요청이 들어가면 '수리 중'으로 바뀌어요.";
    } else if (status == "수리 중") {
        return "수리 요청이 들어가 처리 중이에요. 완료되면 이 화면과 내 신고에 바로 표시돼요.";
    } else {
        return "수리가 끝났어요. 아직 고장이면 새로 신고해 주세요.";
    }
}

// 점 + 상태 글자 HTML
function statusHtml(status) {
    return '<span class="status"><span class="dot dot-' + statusClass(status) + '"></span>' + status + '</span>';
}

// 사용자가 쓴 글에 < 나 > 가 있으면 HTML 태그로 읽혀서 화면이 깨진다.
// 그래서 한 글자씩 보면서 바꿔 준다.
function safeText(text) {
    let result = "";
    for (let i = 0; i < text.length; i++) {
        const ch = text[i];
        if (ch == "<") {
            result = result + "&lt;";
        } else if (ch == ">") {
            result = result + "&gt;";
        } else if (ch == "&") {
            result = result + "&amp;";
        } else if (ch == '"') {
            result = result + "&quot;";
        } else {
            result = result + ch;
        }
    }
    return result;
}

// 신고 위치 글자 (공용시설은 장소, 개인 호실은 호실 번호)
function placeText(report) {
    if (report.type == "room") {
        return report.room + "호";
    } else {
        return report.place;
    }
}

// 숫자 통통 튀는 효과
function popEffect(element) {
    element.classList.remove("pop");
    // 이 줄이 있어야 애니메이션이 다시 시작된다고 함
    void element.offsetWidth;
    element.classList.add("pop");
}

// 모든 페이지 아래에 있는 "시연 데이터 처음으로" 버튼
document.addEventListener("DOMContentLoaded", function () {
    const resetButton = document.getElementById("resetButton");

    if (resetButton) {
        resetButton.addEventListener("click", function () {
            const ok = confirm("신고 데이터를 처음 상태로 되돌릴까요?");
            if (ok) {
                // 저장된 사진도 지운다
                const reports = getReports();
                for (let i = 0; i < reports.length; i++) {
                    localStorage.removeItem("fdmPhoto" + reports[i].id);
                }
                localStorage.removeItem("fdmReports");
                localStorage.removeItem("fdmNextId");
                location.reload();
            }
        });
    }
});
