import asyncio
import copy
from datetime import datetime, timedelta, timezone
import random

from sqlalchemy import select

from app.db import async_session
from app.analysis.models import (
    AnalysisResult,
    BlockAnalysis,
    DetectedFeature,
)
from app.project.models import (
    Project,
    ProjectVersion,
)
from app.session.models import Session
from app.user.models import User
from app.auth.utils import hash_password


projects = [
    {
        "title": "flow",
        "device_id": "device-001",
        "versions": [
            {
                "blocks": [
                    {
                        "owner": "Configuration",
                        "name": "flow",
                        "level": 2,
                        "structural_changes": 2,
                        "definition_changes": 2,
                        "definition_level": 2,
                        "feature_guarded_definition_changes": 2,
                        "ast_pipeline_definition_changes": 0,
                    },
                    {
                        "owner": "Configuration",
                        "name": "flow walls",
                        "level": 2,
                        "structural_changes": 0,
                        "definition_changes": 2,
                        "definition_level": 2,
                        "feature_guarded_definition_changes": 2,
                        "ast_pipeline_definition_changes": 0,
                    },
                ],
                "features": {
                    "Difficulty": 1,
                },
                "dead_features": [],
                "project_level": 2,
                "total_scripts": 28,
                "duplicate_scripts": 10,
                "total_combinations": 2,
                "tangling_dict": {"flow": 1},
            },
        ],
    },
    {
        "title": "saludar",
        "device_id": "device-002",
        "versions": [
            {
                "blocks": [
                    {
                        "owner": "Configurator",
                        "name": "saludar",
                        "level": 1,
                        "structural_changes": 1,
                        "definition_changes": 0,
                        "definition_level": 0,
                        "feature_guarded_definition_changes": 0,
                        "ast_pipeline_definition_changes": 0,
                    },
                    {
                        "owner": "Global",
                        "name": "saludar",
                        "level": 3,
                        "structural_changes": 0,
                        "definition_changes": 2,
                        "definition_level": 3,
                        "feature_guarded_definition_changes": 2,
                        "ast_pipeline_definition_changes": 1,
                    },
                ],
                "features": {
                    "Saludar.TuNombre": 1,
                    "Saludar.Hola": 1,
                    "Saludar.MiNombre": 1,
                },
                "dead_features": [],
                "project_level": 3,
                "total_scripts": 19,
                "duplicate_scripts": 8,
                "total_combinations": 8,
                "tangling_dict": {"saludar": 3},
            },
            {
                "blocks": [
                    {
                        "owner": "Configurator",
                        "name": "saludar",
                        "level": 1,
                        "structural_changes": 1,
                        "definition_changes": 0,
                        "definition_level": 0,
                        "feature_guarded_definition_changes": 0,
                        "ast_pipeline_definition_changes": 0,
                    },
                    {
                        "owner": "Global",
                        "name": "saludar",
                        "level": 3,
                        "structural_changes": 0,
                        "definition_changes": 2,
                        "definition_level": 3,
                        "feature_guarded_definition_changes": 2,
                        "ast_pipeline_definition_changes": 1,
                    },
                ],
                "features": {
                    "Saludar.TuNombre": 1,
                    "Saludar.Hola": 1,
                    "Saludar.MiNombre": 1,
                    "Saludar.Nada": 0,
                },
                "dead_features": ["Saludar.Nada"],
                "project_level": 3,
                "total_scripts": 19,
                "duplicate_scripts": 8,
                "total_combinations": 16,
                "tangling_dict": {"saludar": 3},
            },
        ],
    },
]


async def seed_project(db_session, db_project_session, project_data: dict):
    existing = await db_session.scalar(
        select(Project).where(
            Project.title == project_data["title"],
            Project.session_id == db_project_session.id,
        )
    )
    if existing:
        return

    new_project = Project(
        title=project_data["title"],
        device_id=project_data["device_id"],
        session_id=db_project_session.id,
    )

    for version_number, version_data in enumerate(project_data["versions"], start=1):
        new_blocks = [
            BlockAnalysis(
                owner=b["owner"],
                name=b["name"],
                level=b["level"],
                structural_changes=b["structural_changes"],
                definition_changes=b["definition_changes"],
                definition_level=b["definition_level"],
                feature_guarded_definition_changes=b["feature_guarded_definition_changes"],
                ast_pipeline_definition_changes=b["ast_pipeline_definition_changes"],
            )
            for b in version_data["blocks"]
        ]

        new_features = [
            DetectedFeature(
                name=feature,
                is_dead=feature in version_data["dead_features"],
                scattering_count=scattering_count,
            )
            for feature, scattering_count in version_data["features"].items()
        ]

        new_analysis_result = AnalysisResult(
            project_level=version_data["project_level"],
            total_scripts=version_data["total_scripts"],
            duplicate_scripts=version_data["duplicate_scripts"],
            total_combinations=version_data["total_combinations"],
            max_tangling=max(version_data["tangling_dict"].values()) if version_data["tangling_dict"] else 0,
            max_scattering=max(version_data["features"].values()) if version_data["features"] else 0,
            avg_tangling=version_data.get("avg_tangling", 1.5),
            avg_scattering=version_data.get("avg_scattering", 2.0),
            total_modified_blocks=version_data.get("total_modified_blocks", len(new_blocks)),
            total_definition_changes=version_data.get("total_definition_changes", sum(b.definition_changes for b in new_blocks)),
            total_feature_guarded_changes=version_data.get("total_feature_guarded_changes", sum(b.feature_guarded_definition_changes for b in new_blocks)),
            total_ast_pipeline_changes=version_data.get("total_ast_pipeline_changes", sum(b.ast_pipeline_definition_changes for b in new_blocks)),
            blocks_analysis=new_blocks,
            detected_features=new_features,
        )

        new_project.project_versions.append(
            ProjectVersion(
                version_number=version_number,
                analysis_result=new_analysis_result,
            )
        )

    db_session.add(new_project)


async def seed():
    async with async_session() as db_session:
        user = await db_session.scalar(select(User).where(User.username == "user1"))
        if user is None:
            user = User(username="user1", password=hash_password("1234"))
            db_session.add(user)
            await db_session.flush()

        seeded_session = await db_session.scalar(
            select(Session).where(Session.code == "session1")
        )
        if seeded_session is None:
            now = datetime.now(timezone.utc)
            seeded_session = Session(
                name="Session 1",
                code="session1",
                start_date=now,
                end_date=now + timedelta(days=100),
                is_active=True,
            )
            db_session.add(seeded_session)
            await db_session.flush()

        for project_data in projects:
            await seed_project(db_session, seeded_session, project_data)

        base_saludar = next(p for p in projects if p["title"] == "saludar")
        for i in range(1, 21):
            varied_project = copy.deepcopy(base_saludar)
            varied_project["title"] = f"saludar_student_{i}"
            varied_project["device_id"] = f"device-student-{i}"
            
            for version in varied_project["versions"]:
                version["project_level"] = random.choice([1, 2, 3])
                version["total_scripts"] = random.randint(15, 30)
                version["duplicate_scripts"] = random.randint(2, 10)
                version["total_combinations"] = random.randint(4, 20)
                version["avg_tangling"] = round(random.uniform(1.0, 3.5), 2)
                version["avg_scattering"] = round(random.uniform(1.0, 4.0), 2)
                version["total_modified_blocks"] = random.randint(1, 6)
                version["total_definition_changes"] = random.randint(0, 5)
                version["total_feature_guarded_changes"] = random.randint(0, 4)
                version["total_ast_pipeline_changes"] = random.randint(0, 2)
                
            await seed_project(db_session, seeded_session, varied_project)

        await db_session.commit()


if __name__ == "__main__":
    asyncio.run(seed())