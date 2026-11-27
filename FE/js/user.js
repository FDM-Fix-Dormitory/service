// 학생 화면 (신고 현황, 고장 신고, 신고 상세, 내 신고)
// 페이지마다 있는 요소가 달라서 요소가 있을 때만 그 코드를 실행한다.

document.addEventListener("DOMContentLoaded", function () {
    const reports = getReports();

    // =============================
    // 1. 신고 현황 (index.html)
    // =============================
    const publicList = document.getElementById("publicList");

    if (publicList) {
        // 공용시설 신고만 모으기
        let publicReports = [];
        for (let i = 0; i < reports.length; i++) {
            if (reports[i].type == "public") {
                publicReports.push(reports[i]);
            }
        }

        // 같은 문제 많은 순으로 정렬 (버블 정렬)
        for (let i = 0; i < publicReports.length; i++) {
            for (let j = 0; j < publicReports.length - 1; j++) {
                if (publicReports[j].same < publicReports[j + 1].same) {
                    const temp = publicReports[j];
                    publicReports[j] = publicReports[j + 1];
                    publicReports[j + 1] = temp;
                }
            }
        }

        document.getElementById("publicCount").textContent = publicReports.length;

        if (publicReports.length == 0) {
            publicList.innerHTML = '<li><p class="empty">아직 올라온 공용시설 신고가 없어요.</p></li>';
        }

        for (let i = 0; i < publicReports.length; i++) {
            const r = publicReports[i];
            publicList.innerHTML +=
                '<li>' +
                '<a class="report-card bg-' + statusClass(r.status) + '" href="detail.html?id=' + r.id + '">' +
                '<div>' +
                '<h3>' + safeText(r.title) + '</h3>' +
                '<p class="gray-text">' + safeText(r.place) + ' · ' + r.facility + ' · ' + r.date + '</p>' +
                '</div>' +
                '<div class="card-right">' +
                statusHtml(r.status) +
                '<span class="card-same">같은 문제 <span class="same-num">' + r.same + '</span></span>' +
                '</div>' +
                '</a>' +
                '</li>';
        }

        // 오른쪽 "내 신고" 숫자
        let received = 0;
        let checking = 0;
        let repairing = 0;
        let done = 0;

        for (let i = 0; i < reports.length; i++) {
            if (reports[i].mine == true) {
                if (reports[i].status == "접수됨") {
                    received = received + 1;
                } else if (reports[i].status == "확인 중") {
                    checking = checking + 1;
                } else if (reports[i].status == "수리 중") {
                    repairing = repairing + 1;
                } else if (reports[i].status == "완료") {
                    done = done + 1;
                }
            }
        }

        document.getElementById("myReceived").textContent = received;
        document.getElementById("myChecking").textContent = checking;
        document.getElementById("myRepairing").textContent = repairing;
        document.getElementById("myDone").textContent = done;
    }

    // =============================
    // 2. 고장 신고 (report.html)
    // =============================
    const reportForm = document.getElementById("reportForm");

    if (reportForm) {
        const typePublic = document.getElementById("typePublic");
        const typeRoom = document.getElementById("typeRoom");
        const publicOption = document.getElementById("publicOption");
        const roomOption = document.getElementById("roomOption");
        const placeArea = document.getElementById("placeArea");
        const roomArea = document.getElementById("roomArea");
        const publicAside = document.getElementById("publicAside");
        const roomAside = document.getElementById("roomAside");

        // 공용시설 골랐을 때
        typePublic.addEventListener("change", function () {
            publicOption.classList.add("selected");
            roomOption.classList.remove("selected");
            placeArea.classList.remove("hidden");
            roomArea.classList.add("hidden");
            publicAside.style.display = "flex";
            roomAside.classList.add("hidden");
        });

        // 개인 호실 골랐을 때
        typeRoom.addEventListener("change", function () {
            roomOption.classList.add("selected");
            publicOption.classList.remove("selected");
            roomArea.classList.remove("hidden");
            placeArea.classList.add("hidden");
            publicAside.style.display = "none";
            roomAside.classList.remove("hidden");
        });

        // 시설 종류에서 기타 고르면 이름 적는 칸 보이기
        const etcArea = document.getElementById("etcArea");

        document.getElementById("fac1").addEventListener("change", function () {
            etcArea.classList.add("hidden");
        });
        document.getElementById("fac2").addEventListener("change", function () {
            etcArea.classList.add("hidden");
        });
        document.getElementById("fac3").addEventListener("change", function () {
            etcArea.classList.add("hidden");
        });
        document.getElementById("fac4").addEventListener("change", function () {
            etcArea.classList.add("hidden");
        });
        document.getElementById("fac5").addEventListener("change", function () {
            etcArea.classList.add("hidden");
        });
        document.getElementById("fac6").addEventListener("change", function () {
            etcArea.classList.remove("hidden");
            document.getElementById("facilityEtc").focus();
        });

        // 사진 미리보기
        const imageInput = document.getElementById("imageInput");
        const preview = document.getElementById("preview");
        const photoText = document.getElementById("photoText");
        let photoData = "";

        imageInput.addEventListener("change", function () {
            const file = imageInput.files[0];

            if (!file) {
                preview.classList.add("hidden");
                photoText.textContent = "+ 사진 추가하기";
                photoData = "";
                return;
            }

            const reader = new FileReader();

            reader.onload = function (event) {
                photoData = event.target.result;
                preview.src = photoData;
                preview.classList.remove("hidden");
                photoText.textContent = "다른 사진으로 바꾸기";
            };

            reader.readAsDataURL(file);
        });

        // 신고하기 버튼
        reportForm.addEventListener("submit", function (event) {
            event.preventDefault();

            const title = document.getElementById("title");
            const place = document.getElementById("place");
            const roomNumber = document.getElementById("roomNumber");
            const content = document.getElementById("content");

            // 시설 종류: 6개 중에 체크된 것 찾기
            let facilityValue = "기타";
            if (document.getElementById("fac1").checked) {
                facilityValue = "자판기";
            } else if (document.getElementById("fac2").checked) {
                facilityValue = "세탁기";
            } else if (document.getElementById("fac3").checked) {
                facilityValue = "건조기";
            } else if (document.getElementById("fac4").checked) {
                facilityValue = "샤워실";
            } else if (document.getElementById("fac5").checked) {
                facilityValue = "전등";
            } else if (document.getElementById("fac6").checked) {
                facilityValue = "기타";
            }

            // 기타면 적은 이름을 시설 종류로 쓴다
            const facilityEtc = document.getElementById("facilityEtc");
            let etcOk = true;
            if (facilityValue == "기타") {
                if (facilityEtc.value.trim() == "") {
                    etcOk = false;
                } else {
                    facilityValue = facilityEtc.value.trim();
                }
            }

            let isRoom = false;
            if (typeRoom.checked) {
                isRoom = true;
            }

            // 빈칸 검사
            let ok = true;

            if (title.value.trim() == "") {
                document.getElementById("titleError").classList.remove("hidden");
                title.setAttribute("aria-invalid", "true");
                ok = false;
            } else {
                document.getElementById("titleError").classList.add("hidden");
                title.removeAttribute("aria-invalid");
            }

            if (isRoom == false) {
                if (place.value.trim() == "") {
                    document.getElementById("placeError").classList.remove("hidden");
                    place.setAttribute("aria-invalid", "true");
                    ok = false;
                } else {
                    document.getElementById("placeError").classList.add("hidden");
                    place.removeAttribute("aria-invalid");
                }
            }

            if (isRoom == true) {
                // 호실 번호는 숫자만
                if (roomNumber.value.trim() == "" || isNaN(roomNumber.value.trim())) {
                    document.getElementById("roomError").classList.remove("hidden");
                    roomNumber.setAttribute("aria-invalid", "true");
                    ok = false;
                } else {
                    document.getElementById("roomError").classList.add("hidden");
                    roomNumber.removeAttribute("aria-invalid");
                }
            }

            if (etcOk == false) {
                document.getElementById("etcError").classList.remove("hidden");
                facilityEtc.setAttribute("aria-invalid", "true");
                ok = false;
            } else {
                document.getElementById("etcError").classList.add("hidden");
                facilityEtc.removeAttribute("aria-invalid");
            }

            if (content.value.trim() == "") {
                document.getElementById("contentError").classList.remove("hidden");
                content.setAttribute("aria-invalid", "true");
                ok = false;
            } else {
                document.getElementById("contentError").classList.add("hidden");
                content.removeAttribute("aria-invalid");
            }

            if (ok == false) {
                alert("빈칸을 채워 주세요.");
                return;
            }

            // 새 신고 만들기
            const newReport = {
                id: getNextId(),
                type: "public",
                title: title.value.trim(),
                place: place.value.trim(),
                room: "",
                facility: facilityValue,
                content: content.value.trim(),
                status: "접수됨",
                same: 1,
                date: todayText(),
                mine: true,
                pressedSame: false
            };

            if (isRoom == true) {
                newReport.type = "room";
                newReport.place = "";
                newReport.room = roomNumber.value.trim();
                newReport.same = 0;
            }

            reports.push(newReport);
            saveReports(reports);

            // 사진은 따로 저장 (사진이 너무 크면 저장이 안 될 수도 있음)
            let photoSaved = false;
            if (photoData != "") {
                try {
                    localStorage.setItem("fdmPhoto" + newReport.id, photoData);
                    photoSaved = true;
                } catch (error) {
                    alert("사진이 너무 커서 저장하지 못했어요. 신고 내용은 접수됐어요.");
                }
            }

            // 접수 완료 화면 보여 주기
            if (isRoom == true) {
                document.getElementById("doneType").textContent = "개인 호실 (비공개)";
                document.getElementById("donePlaceLabel").textContent = "호실";
                document.getElementById("donePlace").textContent = newReport.room + "호";
            } else {
                document.getElementById("doneType").textContent = "공용시설";
                document.getElementById("donePlaceLabel").textContent = "장소";
                document.getElementById("donePlace").textContent = newReport.place;
            }
            document.getElementById("doneTitle").textContent = newReport.title;
            document.getElementById("doneFacility").textContent = newReport.facility;
            document.getElementById("doneContent").textContent = newReport.content;

            if (photoSaved == true) {
                document.getElementById("donePhoto").textContent = "1장 첨부";
            } else {
                document.getElementById("donePhoto").textContent = "없음";
            }

            document.getElementById("doneDetailLink").href = "detail.html?id=" + newReport.id;
            document.getElementById("doneDetailLink").textContent = "내 신고 자세히 보기";

            document.getElementById("writeArea").style.display = "none";
            document.getElementById("doneArea").style.display = "flex";
            window.scrollTo(0, 0);
        });
    }

    // =============================
    // 3. 신고 상세 (detail.html)
    // =============================
    const detailArea = document.getElementById("detailArea");

    if (detailArea) {
        // 주소에서 id 꺼내기 (detail.html?id=3 이면 3)
        const id = Number(location.search.replace("?id=", ""));
        const report = findReport(reports, id);

        if (report == null) {
            detailArea.style.display = "none";
            document.getElementById("notFound").classList.remove("hidden");
        } else if (report.type == "room" && report.mine == false) {
            // 다른 사람 개인 호실 신고는 못 봄
            detailArea.style.display = "none";
            document.getElementById("notFound").classList.remove("hidden");
            document.getElementById("notFoundTitle").textContent = "볼 수 없는 신고예요";
            document.getElementById("notFoundText").textContent = "개인 호실 신고는 본인과 사감 선생님만 볼 수 있어요.";
        } else {
            showDetail(report);
        }
    }

    function showDetail(report) {
        document.title = "FDM - " + report.title;
        document.getElementById("detailTitle").textContent = report.title;
        document.getElementById("detailStatus").innerHTML = statusHtml(report.status);
        document.getElementById("detailContent").textContent = report.content;
        document.getElementById("factFacility").textContent = report.facility;

        if (report.type == "room") {
            document.getElementById("detailMeta").textContent = report.room + "호 · " + report.facility + " · " + report.date + " 신고";
            document.getElementById("privateBadge").classList.remove("hidden");
            document.getElementById("factType").textContent = "개인 호실";
            document.getElementById("factPlaceLabel").textContent = "호실";
            document.getElementById("factPlace").textContent = report.room + "호";
            document.getElementById("sameBox").classList.add("hidden");
            document.getElementById("otherBox").classList.add("hidden");
            document.getElementById("privateBox").classList.remove("hidden");
            document.getElementById("backLink").href = "my-report.html";
            document.getElementById("backLink").textContent = "← 내 신고로";
        } else {
            document.getElementById("detailMeta").textContent = report.place + " · " + report.facility + " · " + report.date + " 신고";
            document.getElementById("factType").textContent = "공용시설";
            document.getElementById("factPlace").textContent = report.place;
        }

        // 사진
        const photo = localStorage.getItem("fdmPhoto" + report.id);
        if (photo != null) {
            document.getElementById("detailPhoto").src = photo;
            document.getElementById("detailPhoto").classList.remove("hidden");
        }

        // 처리 단계 막대
        const step = statusStep(report.status);
        const barClass = "bar-" + statusClass(report.status);
        document.getElementById("stepText").textContent = "4단계 중 " + step + "단계";
        document.getElementById("stepNote").textContent = statusNote(report.status);

        if (step >= 1) {
            document.getElementById("step1").classList.add("on");
            document.getElementById("bar1").classList.add(barClass);
        }
        if (step >= 2) {
            document.getElementById("step2").classList.add("on");
            document.getElementById("bar2").classList.add(barClass);
        }
        if (step >= 3) {
            document.getElementById("step3").classList.add("on");
            document.getElementById("bar3").classList.add(barClass);
        }
        if (step >= 4) {
            document.getElementById("step4").classList.add("on");
            document.getElementById("bar4").classList.add(barClass);
        }

        // 지금 단계 표시
        const nowStep = document.getElementById("step" + step);
        nowStep.classList.add("current");
        nowStep.setAttribute("aria-current", "step");
        nowStep.innerHTML = nowStep.innerHTML + " · 지금";

        // 같은 문제 버튼
        const sameCount = document.getElementById("sameCount");
        const sameButton = document.getElementById("sameButton");
        const sameMessage = document.getElementById("sameMessage");
        sameCount.textContent = report.same;

        if (report.mine == true) {
            sameButton.disabled = true;
            sameButton.textContent = "내가 올린 신고예요";
            document.getElementById("sameGuide").textContent = "다른 학생들이 같은 문제를 누르면 숫자가 올라가요.";
        } else if (report.pressedSame == true) {
            sameButton.disabled = true;
            sameButton.textContent = "✓ 같은 문제로 표시했어요";
        }

        sameButton.addEventListener("click", function () {
            report.same = report.same + 1;
            report.pressedSame = true;
            saveReports(reports);

            sameCount.textContent = report.same;
            popEffect(sameCount);
            sameButton.disabled = true;
            sameButton.textContent = "✓ 같은 문제로 표시했어요";
            sameMessage.textContent = "표시했어요. 이제 " + report.same + "명이 같은 문제를 겪고 있다고 사감 선생님께 보여요. 한 번만 누를 수 있어요.";
        });
    }

    // =============================
    // 4. 내 신고 (my-report.html)
    // =============================
    const myPublicList = document.getElementById("myPublicList");

    if (myPublicList) {
        const myRoomList = document.getElementById("myRoomList");
        let total = 0;
        let publicNum = 0;
        let roomNum = 0;
        let received = 0;
        let checking = 0;
        let repairing = 0;
        let done = 0;

        // 최근에 올린 게 위로 오게 뒤에서부터 본다
        for (let i = reports.length - 1; i >= 0; i--) {
            const r = reports[i];

            if (r.mine != true) {
                continue;
            }

            total = total + 1;

            if (r.status == "접수됨") {
                received = received + 1;
            } else if (r.status == "확인 중") {
                checking = checking + 1;
            } else if (r.status == "수리 중") {
                repairing = repairing + 1;
            } else if (r.status == "완료") {
                done = done + 1;
            }

            // 진행 막대 4칸
            const step = statusStep(r.status);
            const color = statusColor(r.status);
            let bars = "";
            if (step >= 1) {
                bars = bars + '<span style="background: ' + color + ';"></span>';
            } else {
                bars = bars + '<span></span>';
            }
            if (step >= 2) {
                bars = bars + '<span style="background: ' + color + ';"></span>';
            } else {
                bars = bars + '<span></span>';
            }
            if (step >= 3) {
                bars = bars + '<span style="background: ' + color + ';"></span>';
            } else {
                bars = bars + '<span></span>';
            }
            if (step >= 4) {
                bars = bars + '<span style="background: ' + color + ';"></span>';
            } else {
                bars = bars + '<span></span>';
            }

            let stepWord = "";
            if (step == 1) {
                stepWord = "사감 선생님 확인 전";
            } else if (step == 2) {
                stepWord = "사감 선생님이 확인했어요";
            } else if (step == 3) {
                stepWord = "수리하고 있어요";
            } else {
                stepWord = "수리가 끝났어요";
            }

            if (r.type == "public") {
                publicNum = publicNum + 1;
                myPublicList.innerHTML +=
                    '<a class="my-card bg-' + statusClass(r.status) + '" href="detail.html?id=' + r.id + '">' +
                    '<div class="my-card-left">' +
                    '<div class="title-row"><h3>' + safeText(r.title) + '</h3>' + statusHtml(r.status) + '</div>' +
                    '<p class="gray-text">' + safeText(r.place) + ' · ' + r.facility + ' · ' + r.date + ' · 같은 문제 <span class="same-num">' + r.same + '</span></p>' +
                    '</div>' +
                    '<div class="my-card-right">' +
                    '<div class="mini-steps" aria-hidden="true">' + bars + '</div>' +
                    '<p class="small-text">4단계 중 ' + step + '단계 · ' + stepWord + '</p>' +
                    '</div>' +
                    '</a>';
            } else {
                roomNum = roomNum + 1;
                myRoomList.innerHTML +=
                    '<a class="my-card private bg-' + statusClass(r.status) + '" href="detail.html?id=' + r.id + '">' +
                    '<div class="my-card-left">' +
                    '<div class="title-row"><h3>' + safeText(r.title) + '</h3>' + statusHtml(r.status) +
                    '<span class="fdm-badge fdm-badge-private">비공개 · 개인 호실</span></div>' +
                    '<p class="gray-text">' + safeText(r.room) + '호 · ' + r.facility + ' · ' + r.date + '</p>' +
                    '</div>' +
                    '<div class="my-card-right">' +
                    '<div class="mini-steps" aria-hidden="true">' + bars + '</div>' +
                    '<p class="small-text">4단계 중 ' + step + '단계 · ' + stepWord + '</p>' +
                    '</div>' +
                    '</a>';
            }
        }

        if (publicNum == 0) {
            myPublicList.innerHTML = '<p class="empty">내가 올린 공용시설 신고가 없어요.</p>';
        }
        if (roomNum == 0) {
            myRoomList.innerHTML = '<p class="empty">내가 올린 개인 호실 신고가 없어요.</p>';
        }

        document.getElementById("myTotal").textContent = total;
        document.getElementById("myPublicCount").textContent = publicNum + "건";
        document.getElementById("myRoomCount").textContent = roomNum + "건";
        document.getElementById("countReceived").textContent = received;
        document.getElementById("countChecking").textContent = checking;
        document.getElementById("countRepairing").textContent = repairing;
        document.getElementById("countDone").textContent = done;
    }
});
