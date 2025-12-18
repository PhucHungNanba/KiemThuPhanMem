// testcases.cpp
#include <iostream>
#include <cmath>
#include <vector>
#include <string>
#include <algorithm>
using namespace std;

// ===== BÀI 2: Các hàm theo đề =====
int f1_original(int x) {
    if (x > 10) return 2 * x;
    else return -x;
}

int f1_bug(int x) {
    if (x > 10) return 2 * x;
    else if (x > 0) return -x;
    else return 2 * x;
}

int f2(int x) {
    if (x < 10) return 2 * x;
    else if (x < 2) return -x;
    else return 2 * x;
}

int f3(int x) {
    // theo đề: log(x*x*cos(x)) < 3*x ? 2*x : 2*x
    // (cả 2 nhánh giống nhau nhưng vẫn giữ nguyên biểu thức để tìm lỗi runtime/domain)
    if (log(x * x * cos(x)) < 3 * x) return 2 * x;
    else return 2 * x;
}

int findMax(int num1, int num2, int num3) {
    int max = 0;
    if ((num1 > num2) && (num1 > num3)) max = num1;
    if ((num2 > num1) && (num2 > num3)) max = num2;
    if ((num3 > num1) && (num3 > num2)) max = num3;
    return max;
}

// ===== BÀI 3: Hàm solveQuartic =====
int solveQuartic(double a, double b, double c, double x[]) {
    if (fabs(a) < 1e-12 && fabs(b) < 1e-12 && fabs(c) < 1e-12)
        return -1; // infinite solutions
    if (fabs(a) < 1e-12 && fabs(b) < 1e-12)
        return 0; // no solution

    int n = 0;
    if (fabs(a) < 1e-12) { // bx + c = 0 -> y = -c/b
        double y = -c / b;
        if (y < -1e-12) return 0;
        if (fabs(y) < 1e-12) { x[n++] = 0; return n; }
        double r = sqrt(y);
        x[n++] = r; x[n++] = -r;
        return n;
    }

    double delta = b * b - 4 * a * c;
    if (delta < -1e-12) return 0;

    double sq = sqrt(max(0.0, delta));
    double y1 = (-b + sq) / (2 * a);
    double y2 = (-b - sq) / (2 * a);

    auto addSolutions = [&](double y) {
        if (y > 1e-12) {
            double r = sqrt(y);
            x[n++] = r; x[n++] = -r;
        } else if (fabs(y) < 1e-12) {
            x[n++] = 0;
        }
    };

    addSolutions(y1);
    if (fabs(y2 - y1) > 1e-12) addSolutions(y2);

    return n;
}

// ===== TEST HARNESS =====
void check(const string &name, int got, int expected) {
    if (got == expected)
        cout << "[PASS] " << name << " => " << got << endl;
    else
        cout << "[FAIL] " << name << " => got " << got << " expected " << expected << endl;
}

void checkRoots(const string &name, double a, double b, double c, vector<double> expected) {
    double roots[10];
    int n = solveQuartic(a, b, c, roots);

    // we used expected.size()==0 as marker for "no finite roots" or "infinite" in some cases:
    if (n == -1) {
        // infinite solutions
        if (expected.size() == 0) {
            cout << "[PASS] " << name << " infinite solutions" << endl;
            return;
        } else {
            cout << "[FAIL] " << name << " -> infinite but expected finite" << endl;
            return;
        }
    }

    vector<double> got;
    for (int i = 0; i < n; i++) got.push_back(roots[i]);
    sort(got.begin(), got.end());
    sort(expected.begin(), expected.end());

    if (got.size() != expected.size()) {
        cout << "[FAIL] " << name << " size mismatch (got " << got.size() << ", exp " << expected.size() << ")" << endl;
        return;
    }
    for (size_t i = 0; i < got.size(); i++) {
        if (fabs(got[i] - expected[i]) > 1e-9) {
            cout << "[FAIL] " << name << " wrong value at idx " << i << " (got " << got[i] << ", exp " << expected[i] << ")" << endl;
            return;
        }
    }
    cout << "[PASS] " << name << endl;
}

// ===== MAIN =====
int main() {
    // ---- BÀI 2 ----
    cout << "=== BAI 2 ===" << endl;

    cout << "f1_original" << endl;
    check("f1(-5)", f1_original(-5), 5);   // x < 0
    check("f1(10)", f1_original(10), -10); // x <= 10
    check("f1(11)", f1_original(11), 22);  // x > 10

    cout << "\n=== f1_bug ===" << endl;
    check("f1_bug(-3)", f1_bug(-3), 3);    // x <= 0
    check("f1_bug(5)", f1_bug(5), -5);     // 0 < x <= 10
    check("f1_bug(11)", f1_bug(11), 22);   // x > 10

    cout << "\n=== f2 ===" << endl;
    check("f2(5)", f2(5), 10);   // x < 10
    check("f2(12)", f2(12), 24); // x >= 10

    cout << "\n=== f3 ===" << endl;
    check("f3(1)", f3(1), 2);    // chỉ cần 1 test

    cout << "\n=== findMax ===" << endl;
    // 3 case num1, num2, num3 lớn nhất
    check("findMax(5,3,2)", findMax(5,3,2), 5);   // num1 lớn nhất
    check("findMax(3,6,1)", findMax(3,6,1), 6);   // num2 lớn nhất
    check("findMax(1,2,7)", findMax(1,2,7), 7);   // num3 lớn nhất
    // 3 case tie từng cặp
    check("findMax(4,4,2)", findMax(4,4,2), 4);   // num1 = num2 > num3
    check("findMax(2,7,7)", findMax(2,7,7), 7);   // num2 = num3 > num1
    check("findMax(9,5,9)", findMax(9,5,9), 9);   // num1 = num3 > num2
    // case tất cả bằng nhau
    check("findMax(5,5,5)", findMax(5,5,5), 5);

    // ---- BÀI 3 ----
    cout << "\n=== BAI 3: solveQuartic ===" << endl;
    // Vô số nghiệm
    checkRoots("Case1 (0,0,0)", 0,0,0, {});             
    // Vô nghiệm (bậc 0)
    checkRoots("Case2 (0,0,5)", 0,0,5, {});             
    // Bậc 1 theo y
    checkRoots("Case3 (0,1,4)", 0,1,4, {});             // y < 0
    checkRoots("Case4 (0,1,0)", 0,1,0, {0});            // y = 0
    checkRoots("Case5 (0,1,-4)", 0,1,-4, {2,-2});       // y > 0
    // Bậc 2
    checkRoots("Case6 (1,0,1)", 1,0,1, {});             // delta < 0
    checkRoots("Case7 (1,0,0)", 1,0,0, {0});            // delta = 0, y=0
    checkRoots("Case8 (1,-2,1)", 1,-2,1, {1,-1});       // delta = 0, y>0
    checkRoots("Case9 (1,-5,4)", 1,-5,4, {2,-2,1,-1});  // delta > 0, 2 nghiệm y > 0

    return 0;
}
