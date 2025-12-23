#!/usr/bin/env node

/**
 * 배포 전 필수 체크 스크립트 (Pre-flight Check)
 * 
 * 이 스크립트는 배포 명령어(npm run deploy 등) 실행 시 자동으로 호출되어
 * 다음 사항을 검증합니다:
 * 1. Firebase 로그인 계정 (REQUIRED_ACCOUNT)
 * 2. 활성 Firebase 프로젝트 (Active Project vs .firebaserc)
 * 3. 빌드 결과물 존재 여부 (build 폴더)
 */

import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// --- 환경 설정 ---
const REQUIRED_ACCOUNT = 'jsbae59@gmail.com'; // 배포 권한이 있는 유일한 계정
const BUILD_DIR_NAME = 'build'; // Vite 기본 출력 디렉터리

let hasError = false;
let requiredProject = null;

console.log('\n🔍 [Safety Check] 배포 전 필수 점검 시작...\n');

// 0. 타겟 프로젝트 식별 (.firebaserc 파싱)
try {
    const firebasercPath = join(__dirname, '..', '.firebaserc');
    if (fs.existsSync(firebasercPath)) {
        const firebaserc = JSON.parse(fs.readFileSync(firebasercPath, 'utf-8'));
        requiredProject = firebaserc.projects?.default;
        // console.log(`ℹ️  Target Project defined in .firebaserc: ${requiredProject}`);
    } else {
        console.warn('⚠️  .firebaserc 파일이 없습니다. 프로젝트 일치 여부를 확인할 수 없습니다.');
    }
} catch (e) {
    console.warn('⚠️  .firebaserc 파싱 실패:', e.message);
}

// 1. Firebase 계정 확인
process.stdout.write('1️⃣  Firebase 계정 확인... ');
try {
    // firebase login:list를 사용하여 현재 로그인된 계정을 확인합니다.
    const loginOutput = execSync('firebase login:list', { encoding: 'utf-8', stdio: 'pipe' });
    const loggedInAccount = loginOutput.match(/Logged in as (.+)/)?.[1]?.trim();

    if (!loggedInAccount) {
        console.log('❌\n   Firebase에 로그인되어 있지 않습니다.');
        hasError = true;
    } else if (loggedInAccount !== REQUIRED_ACCOUNT) {
        console.log('❌');
        console.error(`   ⛔ 잘못된 계정입니다: ${loggedInAccount}`);
        console.error(`   ✅ 필수 계정: ${REQUIRED_ACCOUNT}`);
        console.error('   -> 해결: firebase logout 후 firebase login 으로 전환하세요.');
        hasError = true;
    } else {
        console.log(`✅ (${loggedInAccount})`);
    }
} catch (error) {
    // 명령어가 실패한다는 건 로그인이 안되어있거나 CLI 문제
    console.log('❌ 오류 발생');
    console.error('   Firebase CLI 실행 중 오류:', error.message);
    hasError = true;
}

// 2. Firebase 프로젝트 확인
process.stdout.write('2️⃣  Firebase 프로젝트 확인... ');
try {
    let activeProject = null;

    // firebase use 로 현재 활성 alias 확인
    try {
        const useOutput = execSync('firebase use', { encoding: 'utf-8', stdio: 'pipe' });
        const activeMatch = useOutput.match(/Active Project:\s*(.+)/i);
        // "Active Project: complex-name (alias)" 형식일 수 있음
        if (activeMatch) {
            activeProject = activeMatch[1]?.trim();
        } else {
            // "Active Project" 텍스트 없이 그냥 alias 목록만 나오는 경우, * 표시된 줄 찾기
            const asteriskMatch = useOutput.match(/\*\s*(\S+)/);
            if (asteriskMatch) {
                // alias 이름일 수 있음. alias면 실제 ID를 찾아야 함.
                // .firebaserc에서 매핑 확인 필요하지만 복잡하므로 activeProject가 ID라고 가정하거나
                // use output에 괄호로 ID가 같이 나오는지 확인 "(project-id)"
                const idInParens = useOutput.match(/\*\s*.+\s*\((.+)\)/);
                activeProject = idInParens ? idInParens[1] : asteriskMatch[1];
            }
        }
    } catch (e) { /* ignore */ }

    // 만약 activeProject를 못 찾았고, .firebaserc에 default가 있다면 default를 사용한다고 가정
    if (!activeProject && requiredProject) {
        // CLI가 active project가 없으면 default를 씀
        activeProject = requiredProject;
    }

    if (!activeProject) {
        console.log('❌');
        console.error('   활성 프로젝트를 확인할 수 없습니다.');
        hasError = true;
    } else if (requiredProject && activeProject !== requiredProject) {
        console.log('❌');
        console.error(`   ⛔ 프로젝트 불일치!`);
        console.error(`   Current Active : ${activeProject}`);
        console.error(`   Target (.rc)   : ${requiredProject}`);
        console.error(`   -> 해결: 'firebase use default' 또는 'firebase use ${requiredProject}' 실행`);
        hasError = true;
    } else {
        console.log(`✅ (${activeProject})`);
    }
} catch (error) {
    console.log('❌ 오류');
    console.error('   프로젝트 확인 중 예외:', error.message);
    hasError = true;
}

// 3. 빌드 확인
process.stdout.write('3️⃣  빌드 결과물 확인... ');
try {
    const buildDir = join(__dirname, '..', BUILD_DIR_NAME);
    if (!fs.existsSync(buildDir)) {
        console.log('❌');
        console.error(`   ⛔ '${BUILD_DIR_NAME}' 폴더가 없습니다.`);
        console.error('   -> 해결: 먼저 빌드를 실행하세요 (npm run build)');
        // 빌드 없는 배포는 치명적이지 않을 수 있지만(Functions만 배포할 때 등), 
        // 통상적으로 Hosting 배포 시 필수이므로 Error로 처리합니다.
        hasError = true;
    } else {
        console.log('✅');
    }
} catch (error) {
    console.warn('⚠️  빌드 확인 중 오류 (무시 가능)', error.message);
}

console.log('');

// 결과 처리
if (hasError) {
    console.error('🚫 [BLOCK] 배포가 중단되었습니다. 위 에러를 수정한 후 다시 시도하세요.');
    process.exit(1);
} else {
    console.log('✨ 모든 체크 포인트를 통과했습니다. 배포를 시작합니다! 🚀\n');
    process.exit(0);
}
