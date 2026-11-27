// 관리자 화면 (사감 선생님 신고 관리)

let adminReports = [];

// 지금 고른 보기 / 정렬 ("all", "public", "room" / "same", "status", "new", "old")
let filterMode = "all";
let sortMode = "same";

// 지금 표에 보이는 순서 (상태 바꿀 때 순서가 안 바뀌게 기억해 둠)
let shownList = [];

document.addEventListener("DOMContentLoaded", function () {
    adminReports = getReports();
    drawAdmin(true);
});

// "11월 3일" 같은 글자를 1103 같은 숫자로 바꾼다 (날짜 비교하려고)
function dateNumber(text) {
    let month = "";
    let day = "";
    let passedMonth = false;

    for (let i = 0; i < text.length; i++) {
        const ch = text[i];
        if (ch == "월") {
            passedMonth = true;
        } else if (ch >= "0" && ch <= "9") {
            if (passedMonth == false) {
                month = month + ch;
            } else {
                day = day + ch;
            }
        }
    }

    return Number(month) * 100 + Number(day);
}

// a가 b보다 뒤로 가야 하면 true (정렬 방법마다 다름)
function shouldSwap(a, b) {
    if (sortMode == "same") {
        // 같은 문제 많은 게 위로
        if (a.same < b.same) {
            return true;
        }
    } else if (sortMode == "status") {
        // 접수됨 -> 확인 중 -> 수리 중 -> 완료 순서, 같은 상태면 같은 문제 많은 게 위로
        if (statusStep(a.status) > statusStep(b.status)) {
            return true;
        }
        if (statusStep(a.status) == statusStep(b.status) && a.same < b.same) {
            return true;
        }
    } else if (sortMode == "new") {
        // 최근 날짜가 위로 (날짜가 같으면 나중에 올린 게 위로)
        if (dateNumber(a.date) < dateNumber(b.date)) {
            return true;
        }
        if (dateNumber(a.date) == dateNumber(b.date) && a.id < b.id) {
            return true;
        }
    } else if (sortMode == "old") {
        // 오래된 날짜가 위로
        if (dateNumber(a.date) > dateNumber(b.date)) {
            return true;
        }
        if (dateNumber(a.date) == dateNumber(b.date) && a.id > b.id) {
            return true;
        }
    }
    return false;
}

// 보기 버튼 눌렀을 때
function setFilter(mode) {
    filterMode = mode;

    document.getElementById("filterAll").setAttribute("aria-pressed", "false");
    document.getElementById("filterPublic").setAttribute("aria-pressed", "false");
    document.getElementById("filterRoom").setAttribute("aria-pressed", "false");

    if (mode == "all") {
        document.getElementById("filterAll").setAttribute("aria-pressed", "true");
    } else if (mode == "public") {
        document.getElementById("filterPublic").setAttribute("aria-pressed", "true");
    } else if (mode == "room") {
        document.getElementById("filterRoom").setAttribute("aria-pressed", "true");
    }

    drawAdmin(true);
}

// 정렬 버튼 눌렀을 때
function setSort(mode) {
    sortMode = mode;

    document.getElementById("sortSame").setAttribute("aria-pressed", "false");
    document.getElementById("sortStatus").setAttribute("aria-pressed", "false");
    document.getElementById("sortNew").setAttribute("aria-pressed", "false");
    document.getElementById("sortOld").setAttribute("aria-pressed", "false");

    if (mode == "same") {
        document.getElementById("sortSame").setAttribute("aria-pressed", "true");
    } else if (mode == "status") {
        document.getElementById("sortStatus").setAttribute("aria-pressed", "true");
    } else if (mode == "new") {
        document.getElementById("sortNew").setAttribute("aria-pressed", "true");
    } else if (mode == "old") {
        document.getElementById("sortOld").setAttribute("aria-pressed", "true");
    }

    drawAdmin(true);
}

// 표랑 위쪽 숫자를 다시 그린다
// animate가 true면 줄들이 위에서부터 차례로 튀어나온다 (보기/정렬 바꿀 때만)
function drawAdmin(animate) {
    // 위쪽 상태별 숫자는 보기랑 상관없이 전체로 센다
    let received = 0;
    let checking = 0;
    let repairing = 0;
    let done = 0;

    for (let i = 0; i < adminReports.length; i++) {
        if (adminReports[i].status == "접수됨") {
            received = received + 1;
        } else if (adminReports[i].status == "확인 중") {
            checking = checking + 1;
        } else if (adminReports[i].status == "수리 중") {
            repairing = repairing + 1;
        } else if (adminReports[i].status == "완료") {
            done = done + 1;
        }
    }

    document.getElementById("adminReceived").textContent = received;
    document.getElementById("adminChecking").textContent = checking;
    document.getElementById("adminRepairing").textContent = repairing;
    document.getElementById("adminDone").textContent = done;

    // 상태 버튼 눌렀을 때(animate == false)는 정렬을 다시 하지 않고 지금 순서 그대로 쓴다.
    // (다시 정렬하면 누른 줄이 다른 자리로 휙 옮겨져서 다른 줄이 바뀐 것처럼 보였음)
    let list = [];

    if (animate == false && shownList.length > 0) {
        list = shownList;
    } else {
        // 보기에 맞는 신고만 골라서 복사 (원래 목록은 그대로 둠)
        for (let i = 0; i < adminReports.length; i++) {
            if (filterMode == "all") {
                list.push(adminReports[i]);
            } else if (filterMode == adminReports[i].type) {
                list.push(adminReports[i]);
            }
        }

        // 정렬 (버블 정렬)
        for (let i = 0; i < list.length; i++) {
            for (let j = 0; j < list.length - 1; j++) {
                if (shouldSwap(list[j], list[j + 1])) {
                    const temp = list[j];
                    list[j] = list[j + 1];
                    list[j + 1] = temp;
                }
            }
        }

        shownList = list;
    }

    // 오른쪽 안내 글
    let filterWord = "";
    if (filterMode == "all") {
        filterWord = "공용시설 + 개인 호실";
    } else if (filterMode == "public") {
        filterWord = "공용시설만";
    } else {
        filterWord = "개인 호실만";
    }

    let sortWord = "";
    if (sortMode == "same") {
        sortWord = "같은 문제 많은 순";
    } else if (sortMode == "status") {
        sortWord = "처리 급한 순";
    } else if (sortMode == "new") {
        sortWord = "최신순";
    } else {
        sortWord = "오래된 순";
    }

    document.getElementById("sortText").textContent = filterWord + " · " + sortWord;
    document.getElementById("adminTotal").textContent = list.length + "건";

    // 표 만들기
    const table = document.getElementById("adminTable");
    table.innerHTML = "";

    if (list.length == 0) {
        table.innerHTML = '<tr><td colspan="5" class="center">해당하는 신고가 없어요.</td></tr>';
        return;
    }

    for (let i = 0; i < list.length; i++) {
        const r = list[i];
        let rowClass = "";
        let typeCell = "";
        let sameCell = "";
        let meta = "";

        if (r.type == "room") {
            rowClass = "private-row";
            typeCell = '<span class="fdm-badge fdm-badge-private">개인 호실</span>';
            sameCell = '<span class="small-text">해당 없음</span>';
            meta = safeText(r.room) + "호 · " + r.facility + " · " + r.date;
        } else {
            typeCell = "공용시설";
            sameCell = '<span class="same-num">' + r.same + '</span>';
            meta = safeText(r.place) + " · " + r.facility + " · " + r.date;
        }

        // 상태 버튼 4개 (지금 상태인 버튼은 aria-pressed="true")
        let buttons = '<div class="fdm-status-control" role="group" aria-label="' + safeText(r.title) + ' 처리 상태 변경">';

        if (r.status == "접수됨") {
            buttons = buttons + '<button class="fdm-status-btn" type="button" aria-pressed="true" onclick="changeStatus(' + r.id + ', \'접수됨\')">접수됨</button>';
        } else {
            buttons = buttons + '<button class="fdm-status-btn" type="button" aria-pressed="false" onclick="changeStatus(' + r.id + ', \'접수됨\')">접수됨</button>';
        }

        if (r.status == "확인 중") {
            buttons = buttons + '<button class="fdm-status-btn" type="button" aria-pressed="true" onclick="changeStatus(' + r.id + ', \'확인 중\')">확인 중</button>';
        } else {
            buttons = buttons + '<button class="fdm-status-btn" type="button" aria-pressed="false" onclick="changeStatus(' + r.id + ', \'확인 중\')">확인 중</button>';
        }

        if (r.status == "수리 중") {
            buttons = buttons + '<button class="fdm-status-btn" type="button" aria-pressed="true" onclick="changeStatus(' + r.id + ', \'수리 중\')">수리 중</button>';
        } else {
            buttons = buttons + '<button class="fdm-status-btn" type="button" aria-pressed="false" onclick="changeStatus(' + r.id + ', \'수리 중\')">수리 중</button>';
        }

        if (r.status == "완료") {
            buttons = buttons + '<button class="fdm-status-btn" type="button" aria-pressed="true" onclick="changeStatus(' + r.id + ', \'완료\')">완료</button>';
        } else {
            buttons = buttons + '<button class="fdm-status-btn" type="button" aria-pressed="false" onclick="changeStatus(' + r.id + ', \'완료\')">완료</button>';
        }

        buttons = buttons + '</div>';

        // 촤르르륵: 줄마다 0.06초씩 늦게 나오게
        let rowStyle = "";
        if (animate == true) {
            rowClass = rowClass + " row-in";
            rowStyle = ' style="animation-delay: ' + (i * 0.06) + 's;"';
        }

        table.innerHTML +=
            '<tr class="' + rowClass + '"' + rowStyle + '>' +
            '<th scope="row"><span class="row-title">' + safeText(r.title) + '</span><span class="row-meta">' + meta + '</span></th>' +
            '<td>' + typeCell + '</td>' +
            '<td class="center">' + sameCell + '</td>' +
            '<td id="statusCell' + r.id + '">' + statusHtml(r.status) + '</td>' +
            '<td>' + buttons + '</td>' +
            '</tr>';
    }
}

// 상태 버튼 눌렀을 때
function changeStatus(id, newStatus) {
    const report = findReport(adminReports, id);

    if (report == null) {
        return;
    }

    if (report.status == newStatus) {
        return;
    }

    report.status = newStatus;
    saveReports(adminReports);
    drawAdmin(false);

    // 바뀐 칸 통통
    popEffect(document.getElementById("statusCell" + id).firstChild);

    document.getElementById("adminMessage").textContent = "'" + report.title + "' 상태를 '" + newStatus + "'(으)로 바꿨어요.";
}
