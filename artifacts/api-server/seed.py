from database import SessionLocal
from models import Course, EvalType, Quiz, Question, Choice


def seed_default_data():
    db = SessionLocal()
    try:
        # Skip if already seeded
        if db.query(Course).count() > 0:
            return

        # Courses
        courses = [
            Course(name="Mathématiques", description="Algèbre, analyse, probabilités et statistiques"),
            Course(name="Informatique", description="Algorithmique, bases de données, réseaux"),
            Course(name="Physique", description="Mécanique, électromagnétisme, thermodynamique"),
        ]
        for c in courses:
            db.add(c)
        db.flush()

        # Eval types
        eval_types = [
            EvalType(name="Examen"),
            EvalType(name="Interrogation"),
            EvalType(name="TD"),
            EvalType(name="TP"),
        ]
        for e in eval_types:
            db.add(e)
        db.flush()

        math = courses[0]
        info = courses[1]
        phys = courses[2]
        exam = eval_types[0]
        interro = eval_types[1]
        td = eval_types[2]

        # Quiz 1: Algèbre – Examen
        q1 = Quiz(title="Algèbre Linéaire", description="Espaces vectoriels, matrices et déterminants", course_id=math.id, eval_type_id=exam.id)
        db.add(q1)
        db.flush()

        # Questions for quiz 1
        questions_q1 = [
            {
                "type": "mcq",
                "text": "Quelle est la dimension d'un espace vectoriel engendré par les vecteurs (1,0,0), (0,1,0) et (1,1,0) dans ℝ³ ?",
                "choices": [
                    {"text": "1", "is_correct": False},
                    {"text": "2", "is_correct": True},
                    {"text": "3", "is_correct": False},
                    {"text": "0", "is_correct": False},
                ],
                "explanation": "Ces trois vecteurs ne sont pas linéairement indépendants : (1,1,0) = (1,0,0) + (0,1,0). L'espace engendré est donc de dimension 2.",
            },
            {
                "type": "mcq",
                "text": "Le déterminant d'une matrice triangulaire est égal à :",
                "choices": [
                    {"text": "La somme des éléments diagonaux", "is_correct": False},
                    {"text": "Le produit des éléments diagonaux", "is_correct": True},
                    {"text": "Le produit de tous les éléments", "is_correct": False},
                    {"text": "La trace de la matrice", "is_correct": False},
                ],
                "explanation": "Pour toute matrice triangulaire (supérieure ou inférieure), le déterminant est le produit des termes de la diagonale principale.",
            },
            {
                "type": "direct",
                "text": "Donnez la définition d'une application linéaire.",
                "direct_answer": "Une application f : E → F est linéaire si pour tous vecteurs u, v de E et tout scalaire λ, on a f(u+v) = f(u)+f(v) et f(λu) = λf(u).",
            },
        ]

        for i, qdata in enumerate(questions_q1):
            q = Question(quiz_id=q1.id, type=qdata["type"], text=qdata["text"],
                         explanation=qdata.get("explanation"), order_index=i,
                         direct_answer=qdata.get("direct_answer"))
            db.add(q)
            db.flush()
            for cdata in qdata.get("choices", []):
                db.add(Choice(question_id=q.id, text=cdata["text"], is_correct=cdata["is_correct"]))

        # Quiz 2: Probabilités – TD
        q2 = Quiz(title="Probabilités et Statistiques", description="Variables aléatoires et lois classiques", course_id=math.id, eval_type_id=td.id)
        db.add(q2)
        db.flush()

        questions_q2 = [
            {
                "type": "mcq",
                "text": "Si X ~ B(10, 0.5), quelle est l'espérance E(X) ?",
                "choices": [
                    {"text": "2.5", "is_correct": False},
                    {"text": "5", "is_correct": True},
                    {"text": "10", "is_correct": False},
                    {"text": "0.5", "is_correct": False},
                ],
                "explanation": "Pour une loi binomiale B(n, p), l'espérance est E(X) = n·p = 10 × 0.5 = 5.",
            },
            {
                "type": "direct",
                "text": "Énoncer le théorème central limite.",
                "direct_answer": "La somme de n variables aléatoires indépendantes et identiquement distribuées, convenablement normalisée, converge en loi vers une loi normale N(0,1) quand n tend vers l'infini.",
            },
        ]

        for i, qdata in enumerate(questions_q2):
            q = Question(quiz_id=q2.id, type=qdata["type"], text=qdata["text"],
                         explanation=qdata.get("explanation"), order_index=i,
                         direct_answer=qdata.get("direct_answer"))
            db.add(q)
            db.flush()
            for cdata in qdata.get("choices", []):
                db.add(Choice(question_id=q.id, text=cdata["text"], is_correct=cdata["is_correct"]))

        # Quiz 3: Algorithmique – Examen
        q3 = Quiz(title="Algorithmique et Complexité", description="Tri, graphes, complexité temporelle", course_id=info.id, eval_type_id=exam.id)
        db.add(q3)
        db.flush()

        questions_q3 = [
            {
                "type": "mcq",
                "text": "Quelle est la complexité en temps du tri rapide (QuickSort) dans le cas moyen ?",
                "choices": [
                    {"text": "O(n)", "is_correct": False},
                    {"text": "O(n log n)", "is_correct": True},
                    {"text": "O(n²)", "is_correct": False},
                    {"text": "O(log n)", "is_correct": False},
                ],
                "explanation": "Le tri rapide a une complexité moyenne de O(n log n). Dans le pire cas (tableau déjà trié avec un mauvais choix de pivot) la complexité est O(n²).",
            },
            {
                "type": "mcq",
                "text": "Dans un algorithme de parcours en largeur (BFS) d'un graphe avec V sommets et E arêtes, quelle est la complexité ?",
                "choices": [
                    {"text": "O(V)", "is_correct": False},
                    {"text": "O(E)", "is_correct": False},
                    {"text": "O(V + E)", "is_correct": True},
                    {"text": "O(V × E)", "is_correct": False},
                ],
                "explanation": "BFS visite chaque sommet une fois et chaque arête une ou deux fois, d'où une complexité O(V + E).",
            },
            {
                "type": "direct",
                "text": "Qu'est-ce que la notation grand-O (O) ?",
                "direct_answer": "La notation grand-O décrit la borne supérieure asymptotique d'une fonction. On dit que f(n) = O(g(n)) si, à partir d'un certain rang, f(n) ≤ c·g(n) pour une constante c > 0.",
            },
        ]

        for i, qdata in enumerate(questions_q3):
            q = Question(quiz_id=q3.id, type=qdata["type"], text=qdata["text"],
                         explanation=qdata.get("explanation"), order_index=i,
                         direct_answer=qdata.get("direct_answer"))
            db.add(q)
            db.flush()
            for cdata in qdata.get("choices", []):
                db.add(Choice(question_id=q.id, text=cdata["text"], is_correct=cdata["is_correct"]))

        # Quiz 4: Bases de données – Interrogation
        q4 = Quiz(title="Bases de Données Relationnelles", description="SQL, normalisation, transactions", course_id=info.id, eval_type_id=interro.id)
        db.add(q4)
        db.flush()

        questions_q4 = [
            {
                "type": "mcq",
                "text": "Laquelle des propriétés suivantes NE fait PAS partie des propriétés ACID d'une transaction ?",
                "choices": [
                    {"text": "Atomicité", "is_correct": False},
                    {"text": "Cohérence", "is_correct": False},
                    {"text": "Distribution", "is_correct": True},
                    {"text": "Durabilité", "is_correct": False},
                ],
                "explanation": "ACID = Atomicité, Cohérence, Isolation, Durabilité. La Distribution n'en fait pas partie.",
            },
            {
                "type": "mcq",
                "text": "Quelle clause SQL permet de filtrer des groupes dans un GROUP BY ?",
                "choices": [
                    {"text": "WHERE", "is_correct": False},
                    {"text": "HAVING", "is_correct": True},
                    {"text": "FILTER", "is_correct": False},
                    {"text": "SELECT", "is_correct": False},
                ],
                "explanation": "HAVING s'applique après le GROUP BY et filtre sur les agrégats. WHERE filtre avant le regroupement.",
            },
        ]

        for i, qdata in enumerate(questions_q4):
            q = Question(quiz_id=q4.id, type=qdata["type"], text=qdata["text"],
                         explanation=qdata.get("explanation"), order_index=i,
                         direct_answer=qdata.get("direct_answer"))
            db.add(q)
            db.flush()
            for cdata in qdata.get("choices", []):
                db.add(Choice(question_id=q.id, text=cdata["text"], is_correct=cdata["is_correct"]))

        # Quiz 5: Mécanique – Examen
        q5 = Quiz(title="Mécanique du Point", description="Cinématique et dynamique du point matériel", course_id=phys.id, eval_type_id=exam.id)
        db.add(q5)
        db.flush()

        questions_q5 = [
            {
                "type": "mcq",
                "text": "Un objet de masse m est lancé verticalement vers le haut avec une vitesse initiale v₀. Quelle est la hauteur maximale atteinte (en ignorant les frottements) ?",
                "choices": [
                    {"text": "v₀ / g", "is_correct": False},
                    {"text": "v₀² / (2g)", "is_correct": True},
                    {"text": "v₀² / g", "is_correct": False},
                    {"text": "2v₀² / g", "is_correct": False},
                ],
                "explanation": "En appliquant la conservation de l'énergie : ½mv₀² = mgh_max → h_max = v₀²/(2g).",
            },
            {
                "type": "direct",
                "text": "Énoncer la deuxième loi de Newton.",
                "direct_answer": "La résultante des forces exercées sur un point matériel est égale au produit de sa masse par son accélération : ΣF = m·a.",
            },
        ]

        for i, qdata in enumerate(questions_q5):
            q = Question(quiz_id=q5.id, type=qdata["type"], text=qdata["text"],
                         explanation=qdata.get("explanation"), order_index=i,
                         direct_answer=qdata.get("direct_answer"))
            db.add(q)
            db.flush()
            for cdata in qdata.get("choices", []):
                db.add(Choice(question_id=q.id, text=cdata["text"], is_correct=cdata["is_correct"]))

        db.commit()
        print("✓ Seed data inserted successfully")

    except Exception as e:
        db.rollback()
        print(f"Seed error (non-fatal): {e}")
    finally:
        db.close()
